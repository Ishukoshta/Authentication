import React, { useContext, useEffect, useRef } from 'react'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
const EmailVerify = () => {

  axios.defaults.withCredentials = true
  const { backendUrl, userData, getUserdata, setIsloggedin } = useContext(AppContext)
  const navigate = useNavigate()

  const inputRef = useRef([])

  const handleInput = (e, index) => {
    if (e.target.value.length > 0 && index < inputRef.current.length - 1) {
      inputRef.current[index + 1].focus();
    }
  }
  
  const handleKeydown = (e, index) => {
    if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
      inputRef.current[index - 1].focus();
    }
  }

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData('text')
    const pasteArray = paste.split('')
    pasteArray.forEach((char, index) => {
      if (inputRef.current[index]) {
        inputRef.current[index].value = char;
      }
    })
  }

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault();
      const optarray = inputRef.current.map(e=>e.value)
      const otp = optarray.join('')

      const {data} = await axios.post(backendUrl + '/api/auth/verify-account',{otp})
      if(data.success){
        toast.success(data.message)
        getUserdata()
        navigate('/')
      }
      else{
        toast.error(data.message)
      }
    } catch (error) {
        toast.error(error.message)

    }
  }
useEffect(()=>{
  setIsloggedin && userData && userData.isAccountVerifiedAt && navigate('/')
},[setIsloggedin,userData])

  return (
    <div className='flex items-center justify-center min-h-screen  bg-linear-to-br from-blue-200 to bg-purple-400'>
      <img onClick={() => navigate('/')} src={assets.logo} className='absolute left-5 sm:left-20 top-5 w-28 cursor-pointer' alt="" />

      <form onSubmit={onSubmitHandler} className='bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm'>
        <h1 className='text-white text-2xl font-semibold text-center mb-4'>Email Verify OTP</h1>
        <p className='text-center mb-6 text-indigo-300'>Enter OTP</p>
        <div className='flex justify-between mb-8' onPaste={handlePaste}>
          {Array(6).fill(0).map((_, index) => (
            <input ref={(e) => inputRef.current[index] = e}
              onInput={(e) => handleInput(e, index)}
              onKeyDown={(e) => handleKeydown(e, index)} type="text" maxLength='1' key={index} required
              className='w-12 h-12 bg-[#333a5c] text-white text-center text-xl rounded-md' />
          ))}
        </div>
        <button className='w-full py-3 bg-linear-to-r from-indigo-500 to-indigo-900 text-white rounded-full'>Verify email</button>
      </form>
    </div>
  )
}

export default EmailVerify