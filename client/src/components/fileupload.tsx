import './auth.css'
import { useRef, useState } from 'react';
import { serverUrl } from './head';



export const Upload = ()=>{
    const [alert, setAlert] = useState({alert: !true, message: ''});
    const [requsting, setRequestStatus] = useState(false)
    const [uploadingFile, setUploadingFile] = useState<NonNullable<HTMLInputElement['files']>[number]|null>(null);
    const ref_1 = useRef<HTMLInputElement>(null);
    const ref_2 = useRef<HTMLTextAreaElement>(null);
    const ref_3 = useRef<HTMLTextAreaElement>(null);


    const onSubmit = ()=>{
        if(requsting){return;}
        setRequestStatus(true);
        
        // let file = ref_1.current?.value;
        let title = ref_2.current?.value||'';
        let description = ref_3.current?.value||'';
        if(!uploadingFile){
            setRequestStatus(false);
            return setAlert({alert: true, message: 'This file type is not supported.'})
        }
        
        if(uploadingFile.size>1024 * 1024 * 5.9){
            setRequestStatus(false);
            return setAlert({alert: true, message: 'Your file is too big in size. File size limit is 6MB.'})
        }
        if(uploadingFile.type.startsWith('vid')){
            setRequestStatus(false);
            return setAlert({alert: true, message: 'This file type is not supported.'})
        }
        title = title.trim();
        description = description.trim();
        if(!title){
            setRequestStatus(false);
            return setAlert({alert: true, message: 'Title field cannot be empty.'})
        }else if(title.length>100){
            setRequestStatus(false);
            return setAlert({alert: true, message: 'Title field cannot be exceed 100 characters.'})
        }
        if(!description){
            setRequestStatus(false);
            return setAlert({alert: true, message: 'File description field cannot be empty.'})
        }else if(description.length>2000){
            setRequestStatus(false);
            return setAlert({alert: true, message: 'File description field cannot exceed 2000 characters.'})
        }
        const form = new FormData();
        form.append('file', uploadingFile);
        form.append('title', title);
        form.append('description', description)
        return fetch(`${serverUrl}/admin/upload`,{
            method: 'POST',
            body: form,
            // headers: {'Content-Type': 'multipart/form-data'}
        })
        .then((response)=>{
            if(response.ok){
                window.alert('File uploaded successfully!');
                // allow 
                ref_2.current&& (ref_2.current.value = '');
                ref_3.current&& (ref_3.current.value = '');
                setAlert({alert: false, message: ''});
                setUploadingFile(null);
                setRequestStatus(false);
            }else{
                setRequestStatus(false);
                setAlert({alert: true, message: 'Couldn\'t upload. Something went wrong. Try again.'})
            }
        })
        .catch((err)=>{
            setRequestStatus(false);
            setAlert({alert: true, message: 'Please check your internet connection.'})
        });
        
    }

    const inputOnfocus = ()=>{
       if(alert.alert){
        setAlert({alert: false, message: ''})
       }
    }

    return (
        <div className="auth-card-container upload">
            <div style={{backgroundColor: 'rgba(30, 199, 72, 1)', padding: '17px 20px', position: 'absolute', top: 0, left: 0, right: 0}}>
                
                <div style={{display: 'flex', justifyContent: 'space-between', flexFlow: 'wrap', alignItems: 'center'}}>
                    <h3 style={{color: '#ffffff', margin: 0}}>Upload file</h3>
                    
                </div>
            </div>
            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', padding: '60px 0px 0px 0px'}}>
                <label>
                    <input onChange={(e)=>{
                         inputOnfocus();
                         const file = e.target.files;
                        if(file&&file.length>0&&!file[0].type.startsWith('vid')){
                            setUploadingFile(file[0])
                        }
                    }} ref={ref_1} name="file" type="file" />
                </label>
                <label>
                    <textarea rows={3} ref={ref_2} onFocus={inputOnfocus} name="title" maxLength={2000} placeholder="Add some title" />
                </label>
                <label>
                    <textarea rows={7} ref={ref_3} onFocus={inputOnfocus} name="description" maxLength={2000} placeholder="Add some description" />
                </label>
                <div style={{marginBottom: 30, color: 'red', visibility: !alert.alert?'hidden':'visible', fontSize: 16}}>{alert.message}</div>
                <div className="card-button">
                    <button onClick={onSubmit} style={{maxWidth: 400}}>{requsting?'Please wait...':'Upload'}</button>
                </div>
            </div>
        </div>
    )
}

