import './filecard.css';
import example_doc from '../assets/example_doc.png'
import { serverUrl } from './head';
import { useState } from 'react';

export type CardProps = {
    title: string; img: string; type?: 'image'|'doc', description: string;
    downloadCount: number; shareCount: number; id: string;
}
export const FileCards = ({ 
    title, type, img,
    description, downloadCount,
    shareCount, id
}: CardProps)=>{
    const [share, setShare] = useState(shareCount);
    const [download, setDownload] = useState(downloadCount);
    const [requesting, setRequest] = useState(false)
    const onDowload = ()=>{
        if(requesting) return;
        setRequest(true);
        fetch(`${serverUrl}/file_count/download`,{
            method: 'GET',
            // body: JSON.stringify({
            //     download: true
            // }),
            // headers: {
            //     'Content-Type':'application/json'
            // }
        })
        .then((response)=>{
            response.json()
            .then((data)=>{
                setDownload(data.downloadCoun);
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
                <div style={{marginTop: 10}}>
                    <span style={{
                        backgroundColor: 'rgba(0, 255, 76, 0.189)',
                        padding: '4px 10px', fontWeight: 500,
                        borderRadius: '15px'
                    }}> {download} downloadeds </span>
                    <span style={{
                        marginLeft: 20, backgroundColor: 'rgba(0, 255, 255, 0.219)',
                        padding: '4px 10px', fontWeight: 500, borderRadius: '15px'
                    }}>{share} shares</span>
                </div>
                <h3>{title}</h3>
                <p>{description}</p>
                <div className="card-heading">
                    {/* <div></div> */}
                    <button onClick={onDowload}>Download file</button>
                    <div>
                        <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  strokeWidth="2"  strokeLinecap="round"  strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M8 9h-1a2 2 0 0 0 -2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-8a2 2 0 0 0 -2 -2h-1" /><path d="M12 14v-11" /><path d="M9 6l3 -3l3 3" /></svg>
                    </div>
                </div>
            </div>
        </div>
    )
}

