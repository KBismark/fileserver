import React, { useEffect, useState } from 'react';
import {configureForReact, createStore} from 'statestorejs'
import logo from './logo.svg';
import './App.css';
import { CardProps, FileCards } from './components/filecard';
import example_img from './assets/example_img.jpg'
import example_doc from './assets/example_doc.png'
import { Header, serverUrl } from './components/head';
import { Login, type SiteData } from './components/auth';

configureForReact(React);


createStore<SiteData>('datastore', 'site', {email: '', loggedIn: false, files: []});

function App() {
  let pathname = `${window.location.pathname}`.toLowerCase();
  const isContentPage = pathname==='/content';
  const [contentData, setData] = useState<{email: string; content: CardProps[] }>({email: '', content: []});
  const [fetchErrored, setFetchError] = useState<boolean>(false);
  const [isFetching, setFetch] = useState<boolean>(false);
  const isResetPassword = pathname === '/auth/reset';
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
            setFetch(false);
            setFetchError(true)
          })
        }
        setFetch(false);
       setFetchError(true)
    })
    .catch((err)=>{
      setFetch(false);
     setFetchError(true)
    })
  }
  return (
    <div className="App">
      
      {(isContentPage&&contentData.email.length<1)&&<Header email={contentData.email} />}
      {/* <div style={{width: '100%', display: 'flex', justifyContent: 'center'}}> */}
        <main className='Main'>
          {
            !isContentPage&&<Login resetPassword={isResetPassword} passwordResetData={authData} />
          }
          {
            (isContentPage&&contentData.email.length>1)&&
            contentData.content.map((file)=>{
              return  <FileCards img={file.type==='doc'?example_doc:file.img} title={file.title} description={file.description} />
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
              <p>Check your internet connection and try again</p>
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
