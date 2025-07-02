import React from 'react'
import { useState } from 'react'
import supabase_client from '../supabase/client'

const Login = () => {

    const [isSubmitting, setIsSubmitting] = useState(false)
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
        } catch (error) {
            console.log(error);
        }
        setIsSubmitting(false);
        setEmail('');
    };


    return (
        <div className='bg-amber-100 flex w-full h-full justify-center items-center'>
            <form className='flex justify-center items-center gap-4 bg-amber-200 rounded-md p-4'
            onSubmit={handleSubmit}>
                <input
                className='rounded-md p-2 border-2 border-blue-500'
                name='email' 
                type='email' 
                placeholder='Your email'
                onChange={(e) => setEmail(e.target.value)}
                />
                <button className='bg-blue-500 flex justify-center items-center p-2 rounded-md'
                type='submit'
                disabled={isSubmitting}
                >
                    {isSubmitting ? 'Sending...' : 'Send'}
                </button>
            </form>
        </div>
    );
};

export default Login;