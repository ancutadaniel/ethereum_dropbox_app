// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Dropbox {
  address public owner;
  string public name = "Dropbox";
  uint public fileCount;

  struct File {
    uint fileId;
    string fileHash;
    uint fileSize;
    string fileType;
    string fileName;
    string fileDescription;
    uint uploadTime;
    address payable uploader;
  }

  mapping(uint => File) public files;

  event UploadFile(
    uint fileId,
    string fileHash,
    uint fileSize,
    string fileType,
    string fileName,
    string fileDescription,
    uint uploadTime,
    address payable uploader
  );

  constructor() {
    owner = msg.sender;
  }

  function uploadFile(
    string memory _fileHash,
    uint _fileSize,
    string memory _fileType,
    string memory _fileName,
    string memory _fileDescription) public {
    
    require(bytes(_fileHash).length > 1, 'Should have a correct hash');  
    require(bytes(_fileType).length > 1, 'Should have set a type');  
    require(bytes(_fileName).length > 1, 'Should have set a name');  
    require(bytes(_fileDescription).length > 1, 'Should have set a description');
    require(msg.sender != address(0), "Should have a valid address");  
    require(_fileSize > 0, "Should have a file size > 0");

    fileCount += 1;
    
    files[fileCount] = File(
      fileCount,
      _fileHash,
      _fileSize,
      _fileType,
      _fileName,
      _fileDescription,
      block.timestamp,
      payable(msg.sender)
    );
  
    emit UploadFile(
      fileCount,
      _fileHash,
      _fileSize,
      _fileType,
      _fileName,
      _fileDescription,
      block.timestamp,
      payable(msg.sender)
    );

  }
}
