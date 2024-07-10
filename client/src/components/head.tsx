
import { useState } from 'react'
import './header.css'

export const serverUrl = window.location.origin;

type Props = {email: string}
export const Header = ({email}: Props)=>{
    const [loggingOut, setLog] = useState(false);
    const onLogout = ()=>{
        if(loggingOut) return;
        setLog(true);

        fetch(`${serverUrl}/auth/request_reset`,{
            method: 'PATCH',
            body: JSON.stringify({}),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then((response)=>{
            if(response.ok){
                window.location.replace(`${window.location.origin}/`);
                return;
            }
            alert('Please check your internet connection.')
            setLog(false);
        })
        .catch((err)=>{
            alert('Please check your internet connection.')
            setLog(false);
        })
    }


    email = (email.length>20? `${email.slice(0,20)}...`: email).toLowerCase()
    
    return (
        <header className="header">
            <div style={{fontWeight: 500,}}>Hi, {email}</div>
            <div>
                <button onClick={onLogout}>Logout</button>
            </div>
        </header>
    )
}
