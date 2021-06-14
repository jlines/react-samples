import React from 'react';
import { QueryClient, QueryClientProvider, useQuery } from 'react-query'
import { Table } from 'antd';
import './App.css';
import config from './creds.json';

const queryClient = new QueryClient()

const App = () => (
  <div className="App">
    
    <QueryClientProvider client={queryClient}>
       
       <ServerPaginatedData />
       <br /><br /><br />
       <PreloadClientPaginatedData />

     </QueryClientProvider>
  </div>
);

function ServerPaginatedData() {
  const [page, setPage] = React.useState(0)
  const [lastKey, setLastKey] = React.useState([])
 
  var header = {"Authorization": "Bearer " + config.accessToken};
  var url = "https://m5jy5zdds1.execute-api.us-east-1.amazonaws.com/qa/release?product=Apple+Pie&env=internal&repository=wolf&limit=10";

  const fetchReleases = (page = 0) => {
    console.log(page, lastKey)
    return fetch(url + (page>0?'&startKey=' + lastKey[page-1]:''), {headers:header}).then((res) => res.json())
  }

   const {
     isLoading,
     isError,
     error,
     data,
     isFetching,
     isPreviousData,
   } = useQuery(['releases', page], () => fetchReleases(page), { keepPreviousData : true })


 
   return (
     <div>
      <span>Current Page: {page + 1} out of {lastKey.length+1}</span>
       <button
         onClick={() => setPage(old => Math.max(old - 1, 0))}
         disabled={page === 0}
       >
         Previous Page
       </button>{' '}
       <button
         onClick={() => {
           if (data.lastKey) {
            
             setPage(old => old + 1)

             if(lastKey.indexOf(data.lastKey)===-1)
              setLastKey(lastKey.concat(data.lastKey))
           }
         }}
         // Disable the Next Page button until we know a next page is available
         disabled={isPreviousData || !data?.lastKey}
       >
         Next Page
       </button>

       {isLoading ? (
         <div>Loading...</div>
       ) : isError ? (
         <div>Error: {error.message}</div>
       ) : (
         <div>           
           <Table dataSource={data['items']} columns={columns} loading={isFetching && isPreviousData} pagination={false}
           />
         </div>
       )}

       
       
       {isFetching ? <span> Fetching...</span> : null}{' '}
     </div>
   )
 }

function PreloadClientPaginatedData() {
  var header = {"Authorization": "Bearer " + config.accessToken};
  var url = "https://m5jy5zdds1.execute-api.us-east-1.amazonaws.com/qa/release?product=Apple+Pie&env=internal&repository=wolf&limit=10";


  const fetchReleasesRecursive = (last = null) => {
    return fetch(url + (last!=null?'&startKey=' + last:''), {headers:header})
          .then((res) => res.json())
          .then((data) => {
            if(data.lastKey) {
              return fetchReleasesRecursive(data.lastKey)
              .then((nextData) => {
                data.items = data.items.concat(nextData.items);
                return data;
              })
            }
            else {
              return data;
            }
          })
   }

   const {
     isLoading,
     isError,
     error,
     data,
     isFetching,
   } = useQuery('releases', () => fetchReleasesRecursive(), { keepPreviousData : true })


 
   return (
     <div>
       {isLoading ? (
         <div>Loading...</div>
       ) : isError ? (
         <div>Error: {error.message}</div>
       ) : (
         <div>           
           <Table dataSource={data['items']} columns={columns}
           />
         </div>
       )}

       
       
       {isFetching ? <span> Fetching...</span> : null}{' '}
     </div>
   )
 }



const columns = [
  {
    title: 'repository',
    dataIndex: 'repository',
    key: 'repository',
  },
  {
    title: 'size',
    dataIndex: 'size',
    key: 'size',
  },
  {
    title: 'version',
    dataIndex: 'version',
    key: 'version',
  },
  {
    title: 'release',
    dataIndex: 'release',
    key: 'release',
  },
  {
    title: 'createdTime',
    dataIndex: 'createdTime',
    key: 'createdTime',
  },
  {
    title: 'description',
    dataIndex: 'description',
    key: 'description',
  },
  {
    title: 'modifiedTime',
    dataIndex: 'modifiedTime',
    key: 'modifiedTime',
  },
  {
    title: 'env',
    dataIndex: 'env',
    key: 'env',
  },
];

export default App;
