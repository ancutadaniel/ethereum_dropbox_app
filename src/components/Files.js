import { Table, Icon, Button } from 'semantic-ui-react';
import { convertBytes } from '../utils/convertBytes';
import moment from 'moment';

const Files = ({ files }) => {
  const header = [
    'Id',
    'Name',
    'Description',
    'Type',
    'Size',
    'Date',
    'Uploader/View',
    'Hash/View/Get',
  ];
  const url = `https://ipfs.infura.io/ipfs/`;

  return (
    <Table celled inverted selectable>
      <Table.Header>
        <Table.Row>
          {header?.map((headerName, i) => {
            return <Table.HeaderCell key={i}>{headerName}</Table.HeaderCell>;
          })}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {files?.map((file) => {
          const {
            fileDescription,
            fileHash,
            fileId,
            fileName,
            fileSize,
            fileType,
            uploadTime,
            uploader,
          } = file;

          return (
            <Table.Row key={fileId}>
              <Table.Cell>{fileId}</Table.Cell>
              <Table.Cell>{fileName}</Table.Cell>
              <Table.Cell>{fileDescription}</Table.Cell>
              <Table.Cell>{fileType}</Table.Cell>
              <Table.Cell>{convertBytes(fileSize)}</Table.Cell>
              <Table.Cell>
                {moment.unix(uploadTime).format('h:mm:ss A M/D/Y')}{' '}
              </Table.Cell>
              <Table.Cell>
                <a
                  href={'https://etherscan.io/address/' + uploader}
                  rel='noopener noreferrer'
                  target='_blank'
                >
                  {uploader.substring(0, 10)}...
                </a>
              </Table.Cell>
              <Table.Cell>
                <a
                  href={`${url}${fileHash}`}
                  rel='noopener noreferrer'
                  target='_blank'
                >
                  {fileHash.substring(0, 10)}...
                </a>
              </Table.Cell>
            </Table.Row>
          );
        })}
      </Table.Body>
    </Table>
  );
};

export default Files;
