const Dropbox = artifacts.require('Dropbox');
const { assert } = require('chai');
const chai = require('chai');

chai.use(require('chai-as-promised')).should();

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract('Dropbox', function ([deployer, uploader]) {
  let dropbox;

  before(async () => {
    dropbox = await Dropbox.deployed();
  });

  describe('contract is deployed', async () => {
    it('contract should have an address', async () => {
      const address = await dropbox.address;

      assert.notEqual(address, '');
      assert.notEqual(address, 0x0);
      assert.notEqual(address, null);
      assert.notEqual(address, undefined);
      assert.isString(address);
    });

    it('should assert true', async function () {
      await Dropbox.deployed();
      return assert.isTrue(true);
    });

    it('contract should have a name and owner', async () => {
      const name = await dropbox.name();
      const owner = await dropbox.owner();
      assert.equal(name, 'Dropbox');
      assert.equal(owner, deployer);
    });
  });

  describe('contract files', async () => {
    let result, fileCount, event, file;
    const fileHash = 'QmV8cfu6n4NT5xRr2AHdKxFMTZEJrA44qgrBCr739BN9Wb';
    const fileSize = '1';
    const fileType = 'TypeOfTheFile';
    const fileName = 'NameOfTheFile';
    const fileDescription = 'DescriptionOfTheFile';

    before(async () => {
      result = await dropbox.uploadFile(
        fileHash,
        fileSize,
        fileType,
        fileName,
        fileDescription,
        {
          from: uploader,
        }
      );
      fileCount = await dropbox.fileCount();
      event = await result.logs[0].args;
      file = await dropbox.files(fileCount);
    });

    it('upload file', async () => {
      // Success
      assert.equal(fileCount.toNumber(), 1);
      assert.equal(
        event.fileId.toNumber(),
        fileCount.toNumber(),
        'Id is correct'
      );
      assert.equal(event.fileHash, fileHash, 'Hash is correct');
      assert.equal(event.fileSize, fileSize, 'Size is correct');
      assert.equal(event.fileType, fileType, 'Type is correct');
      assert.equal(event.fileName, fileName, 'Name is correct');
      assert.equal(
        event.fileDescription,
        fileDescription,
        'Description is correct'
      );
      assert.equal(event.uploader, uploader, 'Uploader is correct');

      // FAILURE: File must have hash
      await dropbox.uploadFile(
        '',
        fileSize,
        fileType,
        fileName,
        fileDescription,
        { from: uploader }
      ).should.be.rejected;

      // FAILURE: File must have size
      await dropbox.uploadFile(
        fileHash,
        '',
        fileType,
        fileName,
        fileDescription,
        { from: uploader }
      ).should.be.rejected;

      // FAILURE: File must have type
      await dropbox.uploadFile(
        fileHash,
        fileSize,
        '',
        fileName,
        fileDescription,
        { from: uploader }
      ).should.be.rejected;

      // FAILURE: File must have name
      await dropbox.uploadFile(
        fileHash,
        fileSize,
        fileType,
        '',
        fileDescription,
        { from: uploader }
      ).should.be.rejected;

      // FAILURE: File must have description
      await dropbox.uploadFile(fileHash, fileSize, fileType, fileName, '', {
        from: uploader,
      }).should.be.rejected;
    });

    it('lists file', async () => {
      assert.equal(
        file.fileId.toNumber(),
        fileCount.toNumber(),
        'id is correct'
      );
      assert.equal(file.fileHash, fileHash, 'Hash is correct');
      assert.equal(file.fileSize, fileSize, 'Size is correct');
      assert.equal(file.fileName, fileName, 'Size is correct');
      assert.equal(
        file.fileDescription,
        fileDescription,
        'description is correct'
      );
      assert.equal(file.uploader, uploader, 'uploader is correct');
    });
  });
});
