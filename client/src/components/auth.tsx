import { useStateStore } from 'statestorejs'
import './auth.css'
import { useRef, useState } from 'react';

export const serverUrl = process.env.REACT_APP_SERVER_URL||'http://localhost:3034'||window.location.origin;

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
                                window.alert('Your password has been reset. Please login to your account.');
                                window.location.replace(`${window.location.origin}/content?r=1`);
                                
                            }else{
                                setAlert({alert: true, message: 'Sorry, something went wrong. Try again later.'})
                            }
                            setRequestStatus(false);
                        })
                        .catch((err)=>{
                            setRequestStatus(false);
                            setAlert({alert: true, message: 'An error occured. Check your internet connection.'})
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
                                window.alert('Please check your email for a link to reset your password.');
                                setFormType('sign_in');
                                
                            }else{
                                setAlert({alert: true, message: 'Sorry, something went wrong. Please try again later.'})
                            }
                            setRequestStatus(false);
                        })
                        .catch((err)=>{
                            setRequestStatus(false);
                            setAlert({alert: true, message: 'An error occured. Please check your internet connection.'})
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
                                window.location.replace(`${window.location.origin}/content?r=1`)
                            }else{
                                window.alert('Successfuly signed up! Please login to see available documents');
                                setFormType('sign_in');
                            }
                            setRequestStatus(false);
                        }else{
                            setRequestStatus(false);
                            setAlert({alert: true, message: 'Incorrect password or email.'})
                        }
                    })
                    .catch((err)=>{
                        setRequestStatus(false);
                        setAlert({alert: true, message: 'An error occured. Please check your internet connection.'})
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

