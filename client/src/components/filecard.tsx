import './filecard.css';
import example_doc from '../assets/example_doc.png'
import { serverUrl } from './head';
import { useEffect, useRef, useState } from 'react';
import { updateStore, useStateStore } from 'statestorejs';

export type CardProps = {
    title: string; img: string; type?: 'image'|'doc', description: string;
    downloadCount: number; shareCount: number; id: string; isAdmin?:boolean
}
export const FileCards = ({ 
    title, type, img,
    description, downloadCount,
    shareCount, id, isAdmin
}: CardProps)=>{
    const [share, setShare] = useState(shareCount);
    const [download, setDownload] = useState(downloadCount);
    const [requesting, setRequest] = useState(false)
    const onDowload = ()=>{
        if(requesting) return;
        setRequest(true);
        fetch(`${serverUrl}/file_count/download/${id}`,{
            method: 'GET',
        })
        .then((response)=>{
            response.json()
            .then((data)=>{
                setDownload(data.downloadCount);
                setShare(data.shareCount);
                setRequest(false);
                setTimeout(() => {
                    window.location.assign(img.replace('/files/','/download/'));
                }, 2000);
            })
            .catch((err)=>{
                setRequest(false);
                alert(`Sorry, can't download now.`)
            })
        })
        .catch((err)=>{
            setRequest(false);
            alert(`Sorry, can't download now.`)
        })
    }
    return (
        <div className="card-container">
            <img src={type==='image'?img:example_doc} style={{margin: '5%', width: '90%'}} />
            <div className="card-content">
                {
                    isAdmin&&
                    <div style={{marginTop: 10}}>
                        <span style={{
                            backgroundColor: 'rgb(0, 255, 76, .39)',
                            padding: '3px 10px 4px 10px', fontWeight: 500,
                            borderRadius: '15px', fontSize: '90%'
                        }}> {download} downloads </span>
                        <span style={{
                            marginLeft: 20, backgroundColor: '#00ffff80',
                            padding: '3px 10px 4px 10px', fontWeight: 500, borderRadius: '15px',
                            fontSize: '90%'
                        }}>{share} shares</span>
                    </div>
                }
                <h3 style={{marginTop: isAdmin?15:5, marginBottom: isAdmin?10:8}}>{title.slice(0, 110)}</h3>
                <p>{description.length>150?`${description.slice(0, 150).trim()}...`:description}</p>
                <div className="card-heading">
                    {/* <div></div> */}
                    <button onClick={onDowload}>Download file</button>
                    <div tabIndex={0} role='button' onClick={()=>{
                        updateStore<UI>('datastore', 'ui', {
                            actors: ['shareFile'],
                            store: {
                                shareFile: true, 
                                fileId: id,
                                callback(data) {
                                    setDownload(data.downloadCount);
                                    setShare(data.shareCount);
                                }
                            }
                        })
                    }} >
                        <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  strokeWidth="2"  strokeLinecap="round"  strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M8 9h-1a2 2 0 0 0 -2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-8a2 2 0 0 0 -2 -2h-1" /><path d="M12 14v-11" /><path d="M9 6l3 -3l3 3" /></svg>
                    </div>
                </div>
            </div>
        </div>
    )
}

export type UI = {
    shareFile?:boolean;
    fileId: string;
    callback: (data?: any)=>void
}
export const ShareTo = ()=>{
    const { shareFile, callback, fileId } = useStateStore<UI>('datastore', 'ui', ['shareFile']);
    const ref_1 = useRef<HTMLInputElement>(null);
    const [requesting, setRequest] = useState(false);
    useEffect(()=>{
        if(shareFile){
            document.body.style.overflow = 'hidden';
        }
        return ()=>{
            document.body.style.overflow = '';
        }
    },[shareFile])
    if(!shareFile) return null;
    const onShare = ()=>{
        if(requesting) return;
        const email = (ref_1.current?.value||'').trim();
        if(!email||email.length<3||email.length>100){
            return updateStore<UI>('datastore', 'ui', {
                actors: ['shareFile'],
                store: {shareFile: false, callback(){}, fileId: ''}
            })
        }
        setRequest(true);
        fetch(`${serverUrl}/file_count/share/${fileId}/${email.toLowerCase()}`,{
            method: 'GET',
        })
        .then((response)=>{
            response.json()
            .then((data)=>{
                alert(`File was shared successfully to ${email}.`);
                callback(data);
                setRequest(false);
                updateStore<UI>('datastore', 'ui', {
                    actors: ['shareFile'],
                    store: {shareFile: false, callback(){}, fileId: ''}
                })
            })
            .catch((err)=>{
                alert(`Sorry, can't share now.`);
                setRequest(false);
                updateStore<UI>('datastore', 'ui', {
                    actors: ['shareFile'],
                    store: {shareFile: false, callback(){}, fileId: ''}
                })
            })
        })
        .catch((err)=>{
            alert(`Something went wrong. Please check your internet connection and try again.`);
            setRequest(false);
            updateStore<UI>('datastore', 'ui', {
                actors: ['shareFile'],
                store: {shareFile: false, callback(){}, fileId: ''}
            })
        })
    }
    return (
        <div style={{
            position: 'fixed',top: 0, 
            left: 0, right: 0, bottom: 0, 
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            backgroundColor: '#ffffff'
  
          }}>
            {
              requesting?
              <span className='spinner'></span>:
              <>
               <div style={{display: 'flex',alignItems: 'center', justifyContent: 'center'}}>
                    <h2 style={{marginLeft: 15}}>Share to?</h2>
                    <span onClick={()=>{
                        updateStore<UI>('datastore', 'ui', {
                            actors: ['shareFile'],
                            store: {shareFile: false, callback(){}, fileId: ''}
                        })
                    }} style={{color: 'rgb(30, 199, 72)', cursor: 'pointer'}}>
                     {' Go back'}
                    </span>
               </div>
                <div style={{textAlign: 'center',height: 150}} className='auth-card-container'>
                    <label>
                            <input ref={ref_1}  name="email" type="email" maxLength={100} placeholder="email@example.com" />
                    </label>
                    <button onClick={onShare} className='card-button' style={{padding: '10px 25px'}}>Share file</button>
                </div>
              </>
            }
          </div>
    )
}