import React, { useCallback, useEffect, useState } from 'react';
import getWeb3 from './utils/getWeb3';

import Dropbox from '../src/build/abi/Dropbox.json';
import MainMenu from './components/Menu';
import Files from './components/Files';

import { Button, Container, Form, Divider, Message } from 'semantic-ui-react';
import { create } from 'ipfs-http-client';

const App = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contract, setContract] = useState({});
  const [web3, setWeb3] = useState({});
  const [files, setFiles] = useState([]);

  const [file, setFile] = useState({
    name: '',
    type: '',
    description: '',
  });

  // IPFS Array buffer
  const [bufferFile, setBufferFile] = useState(null);

  const [errors, setErrors] = useState();

  // connect to Infura IPFS API address
  const ipfs = create({
    host: 'ipfs.infura.io',
    port: '5001',
    protocol: 'https',
  });

  const loadWeb3 = async () => {
    try {
      const web3 = await getWeb3();
      if (web3) {
        const getAccounts = await web3.eth.getAccounts();
        // get networks id of deployed contract
        const getNetworkId = await web3.eth.net.getId();
        // get contract data on this network
        const newData = await Dropbox.networks[getNetworkId];
        // check contract deployed networks
        if (newData) {
          // get contract deployed address
          const contractAddress = newData.address;
          // create a new instance of the contract - on that specific address
          const contractData = await new web3.eth.Contract(
            Dropbox.abi,
            contractAddress
          );

          setContract(contractData);
        } else {
          alert('Smart contract not deployed to selected network');
        }
        setWeb3(web3);
        setAccounts(getAccounts);
        setLoading(false);
      }
    } catch (error) {
      setErrors(error);
    }
  };

  const handleUpload = async (e) => {
    try {
      // set file
      const fileUpload = e.target.files[0];
      // create reader - for this file
      const reader = new FileReader();
      // create the array buffer for IPFS
      reader.readAsArrayBuffer(fileUpload);
      // success
      reader.onload = () => setBufferFile(Buffer(reader.result));
      // error
      reader.onerror = () => setErrors(reader.error);

      setFile({
        ...file,
        name: fileUpload.name,
        type: fileUpload.type,
      });
    } catch (error) {
      setErrors(error);
    }
  };

  const handleDescription = (e) => {
    setFile({ ...file, description: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await ipfs.add(bufferFile);
      if (data) handleHashData(data);
      if (file.type === '') setFile({ ...file, type: 'none' });
    } catch (error) {
      setErrors(error);
    }
  };

  const handleHashData = async (data) => {
    setLoading(true);
    const { path, size } = data;
    try {
      // we write data to blockchain
      await contract.methods
        .uploadFile(path, size, file.type, file.name, file.description)
        .send({ from: accounts[0] });
      showFiles();
      setFile({ name: '', type: '', description: '' });
      setLoading(false);
    } catch (error) {
      setErrors(error);
    }
  };

  const showFiles = useCallback(async () => {
    setLoading(true);
    try {
      // read data from blockchain
      const fileCounts = await contract.methods.fileCount().call();
      // read all files and store by newest
      let filesArr = [];
      for (let i = fileCounts; i >= 1; i--) {
        const getFile = await contract.methods.files(i).call();
        const {
          fileDescription,
          fileHash,
          fileId,
          fileName,
          fileSize,
          fileType,
          uploadTime,
          uploader,
        } = getFile;

        filesArr.push({
          fileDescription,
          fileHash,
          fileId,
          fileName,
          fileSize,
          fileType,
          uploadTime,
          uploader,
        });
      }
      setFiles(filesArr);
      setLoading(false);
    } catch (error) {
      setErrors(error);
    }
  }, [contract]);

  useEffect(() => {
    if (contract && contract?.options?.address) showFiles();
  }, [contract, showFiles]);

  useEffect(() => {
    loadWeb3();
  }, []);

  return (
    <div className='App'>
      <MainMenu account={accounts[0]} />

      <Divider horizontal>§</Divider>
      <Container>
        <Form onSubmit={handleSubmit} loading={loading}>
          <Form.Input
            label='File Description'
            placeholder='description...'
            name='description'
            type='text'
            value={file.description}
            onChange={handleDescription}
            required
          />
          <Form.Input
            label='Upload File'
            placeholder='Upload File'
            name='fileName'
            type='file'
            onChange={handleUpload}
            required
          />
          <Button color='purple' type='submit'>
            Submit
          </Button>
        </Form>
        {errors && (
          <Message negative>
            <Message.Header>Code: {errors?.code}</Message.Header>
            <p>{errors?.message}</p>
          </Message>
        )}
      </Container>
      <Divider horizontal>§</Divider>
      <Container>
        <Files files={files} />
      </Container>
    </div>
  );
};

export default App;
