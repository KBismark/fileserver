import React, { useEffect, useState } from 'react';
import {configureForReact, createStore} from 'statestorejs'
import './App.css';
import { CardProps, FileCards } from './components/filecard';
import { Header, serverUrl } from './components/head';
import { Login, type SiteData } from './components/auth';
import { Upload } from './components/fileupload';

configureForReact(React);


createStore<SiteData>('datastore', 'site', {email: '', loggedIn: false, files: []});

function App() {
  let pathname = `${window.location.pathname}`.toLowerCase();
  const isContentPage = pathname==='/content';
  const [contentData, setData] = useState<{email: string; content: CardProps[] }>({email: '', content: []});
  const [fetchErrored, setFetchError] = useState<boolean>(false);
  const [isFetching, setFetch] = useState<boolean>(false);
  const isResetPassword = pathname === '/auth/reset';
  const isAdmin = pathname === '/admin'
  const authData = (new URL(window.location.href)).searchParams.get('r')||'';
  useEffect(()=>{
    if(isContentPage){
      fetchData()
    }
  },[]);

  const fetchData = ()=>{
    if(isFetching) return;
    setFetch(true);
    fetch(`${serverUrl}/resource/data`,{
      method: 'GET',
    })
    .then((response)=>{
        if(response.ok){
          return response.json()
          .then((data)=>{
            setFetch(false);
            setFetchError(false)
            setData(data);
          })
          .catch((err)=>{
            setTimeout(() => {
              setFetch(false);
              setFetchError(true)
            }, 1000);
          })
        }
        setTimeout(() => {
          setFetch(false);
          setFetchError(true)
        }, 1000);
    })
    .catch((err)=>{
      setTimeout(() => {
        setFetch(false);
        setFetchError(true)
      }, 3000);
    })
  }
  return (
    <div className="App">
      
      {(isContentPage&&contentData.email.length>1)&&<Header email={contentData.email} />}
      {isAdmin&&<Header email='admin@fileserver.com' />}
      {/* <div style={{width: '100%', display: 'flex', justifyContent: 'center'}}> */}
        <main className='Main'>
          {
            !(isContentPage||isAdmin)&&<Login resetPassword={isResetPassword} passwordResetData={authData} />
          }
          {isAdmin&&<Upload />}
          {
            (isContentPage&&contentData.email.length>1)&&
            contentData.content.map((file)=>{
              return  <FileCards key={file.id} {...file} />
            })
          }
        </main>
      {/* </div> */}
      {
        (isContentPage&&contentData.email.length<1)&&
        <div style={{
          position: 'absolute',top: 0, 
          left: 0, right: 0, bottom: 0, 
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          backgroundColor: '#ffffff'

        }}>
          {
            isFetching?
            <span className='spinner'></span>:fetchErrored?
            <div style={{textAlign: 'center'}}>
              <p>Check your internet connection and try again.</p>
              <button onClick={fetchData} style={{padding: '10px 25px'}}>Try again</button>
            </div>
            :null
          }
        </div>
      }
    </div>
  );
}

export default App;
