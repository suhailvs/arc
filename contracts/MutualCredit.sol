// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Minimal zero-sum mutual-credit ledger. No token is minted or transferred.
contract MutualCredit {
    int256 public constant CREDIT_LIMIT = 1000 ether;
    struct Member { bool exists; int256 creditLimit; int256 balance; }
    mapping(address => Member) public members;
    uint256 public transactionCount;

    event MemberJoined(address indexed member, int256 creditLimit);
    event CreditTransferred(address indexed from, address indexed to, int256 amount);

    function join() external {
        require(!members[msg.sender].exists, "already joined");
        members[msg.sender] = Member(true, CREDIT_LIMIT, 0);
        emit MemberJoined(msg.sender, CREDIT_LIMIT);
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
