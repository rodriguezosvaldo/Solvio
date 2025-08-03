import React, { useContext } from 'react'
import { useState } from 'react'
import supabase_client from '../supabase/client'
import logo from '../assets/logo.png'

const Login = ({ setRefreshUserId }) => {

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [loginState, setLoginState] = useState("");
    const [email, setEmail] = useState('');
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await supabase_client.auth.signInWithOtp({
                email: email,
                options: {
                    emailRedirectTo: 'http://localhost:5173/home'
                }
            });
            setLoginState("Check your email and confirm to Login");
        } catch (error) {
            setLoginState("Error trying to login\nTry again later");
            console.log(error);
        }
        setIsSubmitting(false);
        setEmail('');
        setRefreshUserId(true);
    };


    return (
        <div className='bg-green-950 flex flex-col w-full h-full justify-center items-center gap-12 text-white'>
            <div className='flex flex-col w-80 h-80 justify-center items-center gap-4'>
                <img className='text-4xl font-bold' src={logo} alt="Solvio Logo" />
            </div>

            <form className='bg-green-950 flex justify-center items-center gap-4 rounded-md p-4'
            onSubmit={handleSubmit}>
                <input
                className='rounded-md p-2 border-2 border-blue-600'
                name='email' 
                type='email' 
                placeholder='Your email'
                onChange={(e) => setEmail(e.target.value)}
                />
                <button className='bg-blue-600 flex justify-center items-center p-2 rounded-md hover:scale-105 transition-all duration-300'
                type='submit'
                disabled={isSubmitting}
                >
                    {isSubmitting ? 'Sending...' : 'Send'}
                </button>
            </form>
            <h2 className='text-white text-center'>{loginState}</h2>
        </div>
    );
};

export default Login;