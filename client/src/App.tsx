import React from 'react';
import {configureForReact, createStore} from 'statestorejs'
import logo from './logo.svg';
import './App.css';
import { FileCards } from './components/filecard';
import example_img from './assets/example_img.jpg'
import example_doc from './assets/example_doc.png'
import { Header } from './components/head';
import { Login, type SiteData } from './components/auth';

configureForReact(React);


createStore<SiteData>('datastore', 'site', {email: '', loggedIn: false, files: []});

function App() {
  let pathname = `${window.location.pathname}`;
  
  const isContentPage = pathname.toLowerCase()==='/content';
 
  return (
    <div className="App">
      
      {isContentPage&&<Header email='email.name.user@gmail.com' />}
      {/* <div style={{width: '100%', display: 'flex', justifyContent: 'center'}}> */}
        <main className='Main'>
          {
            !isContentPage&&<Login />
          }
          {
            isContentPage&&
            <>
              <FileCards img={example_img} title='Mr & Mrs Mensah Wedding Card' description='All friends and lovely ones are cordially invited' />
              <FileCards img={example_doc} title='Mr & Mrs Mensah Wedding Card' description='All friends and lovely ones are cordially invited' />
              <FileCards img={example_img} title='Mr & Mrs Mensah Wedding Card' description='All friends and lovely ones are cordially invited' />
              <FileCards img={example_img} title='Mr & Mrs Mensah Wedding Card' description='All friends and lovely ones are cordially invited' />
            </>
          }
        </main>
      {/* </div> */}
    </div>
  );
}

export default App;
