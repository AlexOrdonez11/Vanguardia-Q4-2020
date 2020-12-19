pragma solidity ^0.5.0;

contract DatosDeportivos {
    string public liga;
    
    uint public postCount = 0;

    mapping(uint => Post) public posts;

    struct Post {
        uint id;
        string equipo1;
        string equipo2;
        uint tip;
        address payable author;
    }

    event PostCreated(
        uint id,
        string equipo1,
        string equipo2,
        uint tip,
        address payable author
    );

    event PostTipped(
        uint id,
        string equipo1,
        string equipo2,
        uint tip,
        address payable author
    );

    constructor() public {
        liga = "Champions League";
    }

    function createPost(string memory _e1,string memory _e2) public {
        require(bytes(_e1).length > 0);
        postCount ++;
        posts[postCount] = Post(postCount, _e1,_e2,0, msg.sender);
        // Trigger event
        emit PostCreated(postCount, _e1,_e2,0, msg.sender);
    }

    function tipPost(uint _id) public payable {
        // Make sure the id is valid
        require(_id > 0 && _id <= postCount);
        // Fetch the post
        Post memory _post = posts[_id];
        // Fetch the author
        address payable _author = _post.author;
        // Pay the author by sending them Ether
        address(_author).transfer(msg.value);
        // Incremet the tip amount
        _post.tip = _post.tip + msg.value;
        // Update the post
        posts[_id] = _post;
        // Trigger an event
        emit PostTipped(postCount, _post.equipo1,_post.equipo2, _post.tip, _author);
    }
}
