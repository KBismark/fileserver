import React, { memo, useEffect, useState } from 'react';
import {configureForReact, createStore, updateStore, useStateStore} from 'statestorejs'
import './App.css';
import { CardProps, FileCards, ShareTo, UI } from './components/filecard';
import { Header, pathname, serverUrl, type SiteData } from './components/head';
import { Login } from './components/auth';
import { Upload } from './components/fileupload';

configureForReact(React);


createStore<SiteData>('datastore', 'site', {email: '', content: [], search: ''});
createStore<UI>('datastore', 'ui', {callback(){}, fileId:'', shareFile: false});

function App() {
  const contentData = useStateStore<SiteData>('datastore', 'site', ['email']);
  const [fetchErrored, setFetchError] = useState<boolean>(false);
  const [isFetching, setFetch] = useState<boolean>(false);
  const isContentPage = pathname==='/content';
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
            updateStore<SiteData>('datastore', 'site', {
              store: data,
              actors: ['email']
            })
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
            (isContentPage&&contentData.email.length>1)&&<ContentPageData email={contentData.email} />
          }
        </main>
      {/* </div> */}
      {
        (isContentPage&&contentData.email.length<1)&&
        <div style={{
          position: 'fixed',top: 0, 
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
      <ShareTo />
    </div>
  );
}



const ContentPageData = memo(({email}: {email: string})=>{
  const {content, search} = useStateStore<SiteData>('datastore', 'site', ['search'])
  return (
    <>
    {
      content.filter((file)=>{
        return file.title.toLowerCase().includes(search)||file.description.toLowerCase().includes(search)
      }).map((file)=>{
        return  <FileCards key={file.id} {...file} isAdmin={email==='admin@fileserver.com'}  />
      })
    }
    </>
  )
})











export default App;
