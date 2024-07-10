import { useStateStore } from 'statestorejs'
import './auth.css'
import { useRef, useState } from 'react';
import { serverUrl } from './head';



export type SiteData = {
    loggedIn: boolean;
    email: string;
    files: { img: string; title: string; description: string; }[]
  }

  const info = {
    sign_in: {
        head: 'Sign into your account',
        topButton: 'Register',
        bottomMessage: 'Did you forgot your password?',
        clickableBottomButton: 'Forgot password',
        mainButton: 'Sign into account'
    },
    sign_up: {
        head: 'Create account',
        topButton: 'Sign in',
        bottomMessage: 'Do you have an account already?',
        clickableBottomButton: 'Sign in',
        mainButton: 'Create account'
    },
    forgot: {
        head: 'Reset password',
        topButton: 'Register',
        bottomMessage: 'Don\'t have an account?',
        clickableBottomButton: 'Create account',
        mainButton: 'Reset password'
    },
    reset: {
        head: 'Choose new password',
        topButton: 'Register',
        bottomMessage: 'Don\'t have an account?',
        clickableBottomButton: 'Create account',
        mainButton: 'Reset password'
    }
  }
export const Login = ({resetPassword, passwordResetData}: {resetPassword?:boolean, passwordResetData?:string})=>{
    const { email } = useStateStore<SiteData>('datastore', 'site', []);
    const [formType, setFormType] = useState<'sign_in'|'sign_up'|'forgot'|'reset'>(resetPassword?'reset':'sign_in');
    const [alert, setAlert] = useState({alert: !true, message: ''});
    const [requsting, setRequestStatus] = useState(false)
    const ref_1 = useRef<HTMLInputElement>(null);
    const ref_2 = useRef<HTMLInputElement>(null)

    
    
    const onTopButton = formType==='sign_up'?()=>{
        if(requsting){return;}
        inputOnfocus();
        setFormType('sign_in')
    }:()=>{
        if(requsting){return;}
        inputOnfocus();
        setFormType('sign_up')
    };

    const onForgotPassward = ()=>{
        if(requsting){return;}
        inputOnfocus()
        setFormType('forgot')
    }

    const onSubmit = ()=>{
        if(requsting){return;}
        setRequestStatus(true);
        
        if(formType==='forgot'||resetPassword){
            if(resetPassword){
                let password = ref_2.current?.value;
                if(password&&passwordResetData){
                    password = password.trim();
                    if(password.length>7&&password.length<32&&passwordResetData.length>3&&passwordResetData.length<2000){

                        fetch(`${serverUrl}/auth/reset`,{
                            method: 'PATCH',
                            body: JSON.stringify({password: password, check: passwordResetData}),
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        })
                        .then((response)=>{
                            if(response.ok){
                                window.alert('Your password has been reset. Please log in to your account.');
                                window.location.replace(`${window.location.origin}/`);
                                
                            }else{
                                setAlert({alert: true, message: 'Sorry, something went wrong. Try again later.'})
                            }
                            setRequestStatus(false);
                        })
                        .catch((err)=>{
                            setRequestStatus(false);
                            setAlert({alert: true, message: 'Check your internet connection.'})
                        })
                        return;
                    }
                }
                setRequestStatus(false);
                setAlert({alert: true, message: 'Password must be at least 8 characters and less than 32 characters long.'})
            }else{
                
                let email = ref_1.current?.value;
                if(email){
                    email = email.trim();
                    if(email.length>3&&email.length<100){
                        fetch(`${serverUrl}/auth/request_reset`,{
                            method: 'PUT',
                            body: JSON.stringify({email}),
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        })
                        .then((response)=>{
                            if(response.ok){
                                window.alert('Please check your email for a link to reset your password. Kindly check your spam messages if you can\'t find it.');
                                setFormType('sign_in');
                                setAlert({alert: false, message: ''});
                                // allow 
                                ref_1.current&& (ref_1.current.value = '');
                                
                            }else{
                                setAlert({alert: true, message: 'Sorry, something went wrong. Please try again later.'})
                            }
                            setRequestStatus(false);
                        })
                        .catch((err)=>{
                            setRequestStatus(false);
                            setAlert({alert: true, message: 'Please check your internet connection.'})
                        })
                        return;
                    }
                }
                setRequestStatus(false);
                setAlert({alert: true, message: 'Password must be at least 8 characters and less than 32 characters long.'})
            }
        }else{
            const fType = formType;
            let email = ref_1.current?.value;
            let password = ref_2.current?.value;
            if(email&&password){
                email = email.trim();
                password = password.trim();
                if(email.length>3&&email.length<100&&password.length>7&&password.length<32){
                    fetch(`${serverUrl}/auth/${formType}`,{
                        method: formType==='sign_in'?'PATCH':'POST',
                        body: JSON.stringify({password, email}),
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    })
                    .then((response)=>{
                        if(response.ok){
                            if(fType==='sign_in'){
                                response.json()
                                .then((data)=>{
                                    console.log(data);
                                    
                                    window.location.replace(`${window.location.origin}${data.isAdmin?'/admin?r=true':'/content?r=1'}`);
                                })
                                .catch((err)=>{
                                    setRequestStatus(false);
                                    setAlert({alert: true, message: 'Sorry, something went wrong. Please try again later.'})
                                })
                            }else{
                                window.alert('A verification link has been sent to you to verify your email. Kindly check your spam messages if you can\'t find it.');
                                setFormType('sign_in');
                                setAlert({alert: false, message: ''});
                                // allow 
                                ref_1.current&& (ref_1.current.value = '');
                                ref_2.current&& (ref_2.current.value = '');
                            }
                            setRequestStatus(false);
                        }else{
                            setRequestStatus(false);
                            setAlert({alert: true, message: 'Incorrect password or email.'})
                        }
                    })
                    .catch((err)=>{
                        setRequestStatus(false);
                        setAlert({alert: true, message: 'Please check your internet connection.'})
                    })
                    return;
                }
            }
            setRequestStatus(false);
            setAlert({alert: true, message: 'Password must be at least 8 characters and less than 32 characters long.'})
        }
    }

    const inputOnfocus = ()=>{
       if(alert.alert){
        setAlert({alert: false, message: ''})
       }
    }

    return (
        <div className="auth-card-container">
            <div style={{backgroundColor: 'rgba(30, 199, 72, 1)', padding: '17px 20px', position: 'absolute', top: 0, left: 0, right: 0}}>
                
                <div style={{display: 'flex', justifyContent: 'space-between', flexFlow: 'wrap', alignItems: 'center'}}>
                    <h3 style={{color: '#ffffff', margin: 0}}>{info[formType].head}</h3>
                    {
                        !resetPassword&&
                        <button onClick={onTopButton} style={{maxWidth: 400, backgroundColor: '#eee', color: 'rgb(30, 199, 72)'}}>{info[formType].topButton}</button>
                    }
                </div>
            </div>
            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', padding: '60px 0px 0px 0px'}}>
                {
                    !resetPassword&&
                    <label>
                        <input ref={ref_1} onFocus={inputOnfocus} name="email" type="email" maxLength={100} placeholder="email@example.com" />
                    </label>
                }
               {
                formType!=='forgot'&&
                    <label>
                        <input ref={ref_2} onFocus={inputOnfocus} name="password" type={resetPassword?"text":"password"} maxLength={32} placeholder={resetPassword?"Choose new password":"password"} />
                    </label>
               }
                <div style={{marginBottom: 30, color: 'red', visibility: !alert.alert?'hidden':'visible', fontSize: 16}}>{alert.message}</div>
                <div className="card-button">
                    <button onClick={onSubmit} style={{maxWidth: 400}}>{requsting?'Please wait...':info[formType].mainButton}</button>
                </div>
                {
                    !resetPassword&&
                    <div style={{marginBottom: 20}}>
                        {info[formType].bottomMessage} 
                        <span onClick={formType==='sign_in'?onForgotPassward:onTopButton} style={{color: 'rgb(30, 199, 72)', cursor: 'pointer'}}>
                            {info[formType].clickableBottomButton}
                        </span>
                    </div>
                }
            </div>
        </div>
    )
}


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
        let description = ref_2.current?.value||'';
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
        }else if(description.length<2000){
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

