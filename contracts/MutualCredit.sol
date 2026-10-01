// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Minimal zero-sum mutual-credit ledger. No token is minted or transferred.
contract MutualCredit {
    int256 public constant CREDIT_LIMIT = 1000 ether;
    struct Member { bool exists; int256 creditLimit; int256 balance; string name; }
    mapping(address => Member) public members;
    address[] public memberList;
    uint256 public transactionCount;

    event MemberJoined(address indexed member, int256 creditLimit);
    event CreditTransferred(address indexed from, address indexed to, int256 amount);

    function join(string calldata name) external {
        require(!members[msg.sender].exists, "already joined");
        require(bytes(name).length > 0 && bytes(name).length <= 32, "name must be 1-32 bytes");
        members[msg.sender] = Member(true, CREDIT_LIMIT, 0, name);
        memberList.push(msg.sender);
        emit MemberJoined(msg.sender, CREDIT_LIMIT);
    }

    function memberCount() external view returns (uint256) {
        return memberList.length;
    }

    function getMembers(uint256 offset, uint256 limit)
        external view
        returns (address[] memory addrs, string[] memory names, int256[] memory balances)
    {
        uint256 total = memberList.length;
        if (offset >= total) return (addrs, names, balances);
        uint256 end = offset + limit;
        if (end > total) end = total;
        uint256 n = end - offset;
        addrs = new address[](n);
        names = new string[](n);
        balances = new int256[](n);
        for (uint256 i = 0; i < n; i++) {
            address a = memberList[offset + i];
            addrs[i] = a;
            names[i] = members[a].name;
            balances[i] = members[a].balance;
        }
    }

    function transferCredit(address to, int256 amount) external {
        require(amount > 0, "amount must be positive");
        require(to != msg.sender, "self transfer");
        Member storage from = members[msg.sender];
        Member storage dest = members[to];
        require(from.exists && dest.exists, "both must be members");
        require(from.balance - amount >= -from.creditLimit, "credit limit exceeded");
        from.balance -= amount;
        dest.balance += amount;
        transactionCount++;
        emit CreditTransferred(msg.sender, to, amount);
    }
}
