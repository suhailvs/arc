// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Minimal zero-sum mutual-credit ledger. No token is minted or transferred.
contract MutualCredit {
    struct Member { bool exists; int256 creditLimit; int256 balance; }
    mapping(address => Member) public members;
    uint256 public transactionCount;

    event MemberJoined(address indexed member, int256 creditLimit);
    event CreditLimitChanged(address indexed member, int256 oldLimit, int256 newLimit);
    event CreditTransferred(address indexed from, address indexed to, int256 amount);

    function join(int256 limit) external {
        require(!members[msg.sender].exists, "already joined");
        require(limit > 0, "limit must be positive");
        members[msg.sender] = Member(true, limit, 0);
        emit MemberJoined(msg.sender, limit);
    }

    function setCreditLimit(int256 limit) external {
        Member storage m = members[msg.sender];
        require(m.exists, "not a member");
        require(limit > 0, "limit must be positive");
        require(m.balance >= -limit, "limit below debt");
        int256 old = m.creditLimit;
        m.creditLimit = limit;
        emit CreditLimitChanged(msg.sender, old, limit);
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
