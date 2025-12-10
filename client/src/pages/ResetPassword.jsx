import React, { useContext, useRef, useState } from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const ResetPassword = () => {


  const { backendUrl } = useContext(AppContext)
  axios.defaults.withCredentials = true




  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [isEmailsent, setIsEmailsent] = useState(false)
  const [otp, setOtp] = useState(0)
  const [isotpsubmitted, setIsOtpsubmitted] = useState(false)
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

  const onSubmitEmail = async (e) => {
    e.preventDefault()
    try {
      const { data } = await axios.post(backendUrl + '/api/auth/send-reset-otp', { email })
      if (data.success) {
        toast.success(data.message)
        setIsEmailsent(true)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const onSubmitOTP = async (e) => {
    e.preventDefault();
    const otpArray = inputRef.current.map(e => e.value)
    setOtp(otpArray.join(''))
    setIsOtpsubmitted(true)
  }

  const onSubmitnewPAssword = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(backendUrl + '/api/auth/reset-password', { email, otp, newPassword })
      if (data.success) {
        toast.success(data.message)
        navigate('/login')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }


  return (
    <div className='flex items-center justify-center min-h-screen  bg-linear-to-br from-blue-200 to bg-purple-400'>
      <img onClick={() => navigate('/')} src={assets.logo} className='absolute left-5 sm:left-20 top-5 w-28 cursor-pointer' alt="" />

      {/* Enter email Id */}
      {!isEmailsent &&

        <form onSubmit={onSubmitEmail} className='bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm'>
          <h1 className='text-white text-2xl font-semibold text-center mb-4'>Reset password</h1>
          <p className='text-center mb-6 text-indigo-300'>Enter your register email address</p>
          <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333a5c]'>
            <img src={assets.mail_icon} className='w-3 h-3' alt="" />
            <input value={email} onChange={(e) => setEmail(e.target.value)} required type="email" placeholder='Email' className='bg-transparent outline-none text-white' />
          </div>
          <button className='w-full py-3 bg-linear-to-r from-indigo-500 to-indigo-900 text-white rounded-full'>Submit</button>

        </form>
      }

      {/* otp input form */}

      {!isotpsubmitted && isEmailsent &&
        <form onSubmit={onSubmitOTP} className='bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm'>
          <h1 className='text-white text-2xl font-semibold text-center mb-4'>Reset password OTP</h1>
          <p className='text-center mb-6 text-indigo-300'>Enter OTP</p>
          <div className='flex justify-between mb-8' onPaste={handlePaste}>
            {Array(6).fill(0).map((_, index) => (
              <input ref={(e) => inputRef.current[index] = e}
                onInput={(e) => handleInput(e, index)}
                onKeyDown={(e) => handleKeydown(e, index)} type="text" maxLength='1' key={index} required
                className='w-12 h-12 bg-[#333a5c] text-white text-center text-xl rounded-md' />
            ))}
          </div>
          <button className='w-full py-2.5 bg-linear-to-r from-indigo-500 to-indigo-900 text-white rounded-full'>Submit</button>
        </form>

      }
      {/* enter new Password */}


      {isotpsubmitted && isEmailsent &&
        <form onSubmit={onSubmitnewPAssword} className='bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm'>
          <h1 className='text-white text-2xl font-semibold text-center mb-4'>New password</h1>
          <p className='text-center mb-6 text-indigo-300'>Enter new password</p>
          <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333a5c]'>
            <img src={assets.lock_icon} className='w-3 h-3' alt="" />
            <input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required type="password" placeholder='New password' className='bg-transparent outline-none text-white' />
          </div>
          <button className='w-full py-3 bg-linear-to-r from-indigo-500 to-indigo-900 text-white rounded-full'>Submit</button>

        </form>
      }
    </div>
  )
}

export default ResetPassword