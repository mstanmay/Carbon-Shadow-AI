// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CarbonIdentity
 * @notice Sustainability Identity & Achievement System on Polygon Amoy Testnet
 * @dev Manages user registration, verification, eco badges, and carbon credit tracking
 */
contract CarbonIdentity {
    
    struct UserProfile {
        address wallet;
        bytes32 identityHash;
        uint256 carbonCredits;
        uint256 registeredAt;
        bool isVerified;
        string[] achievementBadges;
    }
    
    struct CarbonEntry {
        uint256 amount;
        string source;      // e.g., "travel_simulation", "solar_panel", "diet_change"
        uint256 timestamp;
        bool isCredit;       // true = saved carbon, false = emitted carbon
    }
    
    // State
    mapping(address => UserProfile) public users;
    mapping(address => CarbonEntry[]) public carbonHistory;
    mapping(address => mapping(string => bool)) public hasBadge;
    
    address public owner;
    uint256 public totalUsersRegistered;
    uint256 public totalCarbonCredited;
    
    // Badge types
    string[] public availableBadges;
    
    // Events
    event UserRegistered(address indexed wallet, bytes32 identityHash, uint256 timestamp);
    event UserVerified(address indexed wallet, uint256 timestamp);
    event EcoBadgeAwarded(address indexed wallet, string badgeType, uint256 timestamp);
    event CarbonCreditsStored(address indexed wallet, uint256 amount, string source, uint256 timestamp);
    event CarbonHistoryQueried(address indexed wallet, uint256 entriesCount);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier onlyRegistered() {
        require(users[msg.sender].wallet != address(0), "User not registered");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        
        // Initialize available badges
        availableBadges.push("Eco Explorer");
        availableBadges.push("Green Commuter");
        availableBadges.push("Solar Champion");
        availableBadges.push("Carbon Guardian");
        availableBadges.push("Climate Architect");
        availableBadges.push("Ocean Protector");
    }
    
    /**
     * @notice Register a new user with blockchain identity
     * @dev Creates identity hash from wallet address and block timestamp
     */
    function registerUser() external {
        require(users[msg.sender].wallet == address(0), "User already registered");
        
        bytes32 identityHash = keccak256(
            abi.encodePacked(msg.sender, block.timestamp, block.prevrandao)
        );
        
        UserProfile storage profile = users[msg.sender];
        profile.wallet = msg.sender;
        profile.identityHash = identityHash;
        profile.carbonCredits = 0;
        profile.registeredAt = block.timestamp;
        profile.isVerified = false;
        
        totalUsersRegistered++;
        
        emit UserRegistered(msg.sender, identityHash, block.timestamp);
    }
    
    /**
     * @notice Verify a registered user's identity
     * @dev Only contract owner can verify users
     * @param _user Address of the user to verify
     */
    function verifyUser(address _user) external onlyOwner {
        require(users[_user].wallet != address(0), "User not registered");
        require(!users[_user].isVerified, "User already verified");
        
        users[_user].isVerified = true;
        
        emit UserVerified(_user, block.timestamp);
    }
    
    /**
     * @notice Award an eco badge to a user
     * @param _user Address of the user
     * @param _badgeType Type of badge to award
     */
    function awardEcoBadge(address _user, string calldata _badgeType) external onlyOwner {
        require(users[_user].wallet != address(0), "User not registered");
        require(!hasBadge[_user][_badgeType], "Badge already awarded");
        
        users[_user].achievementBadges.push(_badgeType);
        hasBadge[_user][_badgeType] = true;
        
        // Bonus carbon credits for earning badges
        users[_user].carbonCredits += 10;
        totalCarbonCredited += 10;
        
        emit EcoBadgeAwarded(_user, _badgeType, block.timestamp);
    }
    
    /**
     * @notice Store carbon credits for a user
     * @param _amount Amount of carbon credits (in kg CO2)
     * @param _source Source of the carbon saving
     */
    function storeCarbonCredits(uint256 _amount, string calldata _source) external onlyRegistered {
        users[msg.sender].carbonCredits += _amount;
        totalCarbonCredited += _amount;
        
        carbonHistory[msg.sender].push(CarbonEntry({
            amount: _amount,
            source: _source,
            timestamp: block.timestamp,
            isCredit: true
        }));
        
        emit CarbonCreditsStored(msg.sender, _amount, _source, block.timestamp);
    }
    
    /**
     * @notice Get carbon history for a user
     * @param _user Address of the user
     * @return entries Array of carbon history entries
     */
    function getCarbonHistory(address _user) external view returns (CarbonEntry[] memory entries) {
        return carbonHistory[_user];
    }
    
    /**
     * @notice Get user profile information
     * @param _user Address of the user
     */
    function getUserProfile(address _user) external view returns (
        address wallet,
        bytes32 identityHash,
        uint256 carbonCredits,
        uint256 registeredAt,
        bool isVerified,
        uint256 badgeCount
    ) {
        UserProfile storage profile = users[_user];
        return (
            profile.wallet,
            profile.identityHash,
            profile.carbonCredits,
            profile.registeredAt,
            profile.isVerified,
            profile.achievementBadges.length
        );
    }
    
    /**
     * @notice Get user's achievement badges
     * @param _user Address of the user
     */
    function getUserBadges(address _user) external view returns (string[] memory) {
        return users[_user].achievementBadges;
    }
    
    /**
     * @notice Get total platform statistics
     */
    function getPlatformStats() external view returns (
        uint256 _totalUsers,
        uint256 _totalCarbonCredited,
        uint256 _totalBadgeTypes
    ) {
        return (totalUsersRegistered, totalCarbonCredited, availableBadges.length);
    }
}
