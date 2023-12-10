import './chatPage.css'
import Input from '../../components/Input/Input';
import Message from '../../components/Message/Message';
import Button from '../../components/Button/Button';
import { useEffect, useRef, useState } from 'react';
import { sha1 } from '../../utils/sha1';
import { generateRandomBigInt, getRSAKeys, encryptRSA, decryptRSA } from '../../utils/RSA';
import { diffieHellman, getPublicKey, getSessionKey } from '../../utils/DiffieHellman';
import bigInt from 'big-integer';
import { rc4Encrypt, rc4Decrypt } from '../../utils/RC4';
import {useNavigate} from 'react-router-dom'

const ChatPage = () => {
  const socket = useRef();
  const status = useRef(false);
  const RSAKeys = useRef(null)
  const sessionKey = useRef('')
  const diffieHellmanSecretKeyRef = useRef('')
  const pRef = useRef('')
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [companionLogin, setCompanionLogin] = useState('')
  const [userLogin, setUserLogin] = useState('')
  const [userPassword, setUserPassword] = useState('')
  const navigate = useNavigate()

  const handleInput = (setState) => {
    return (e) => {
      setState(e.target.value)
    }
  }
  
  const handleAddUser = () => {
    localStorage.removeItem(userLogin)
    localStorage.setItem(userLogin, JSON.stringify({login: userLogin, password: userPassword}))
    setUserLogin('')
    setUserPassword('')
  }

  const handleAuthentication = (login, socket) => {
    const ownerLogin = JSON.parse(localStorage.getItem('owner')).login
    const findedUser = JSON.parse(localStorage.getItem(login))

    if (!findedUser) {
      return
    }

    console.log('логин:', login, 'пользователь:', login)

    const word = generateRandomBigInt(128).toString()
    const timestamp = Date.now() + 1000 * 60 * 10

    console.log('Сгенерированное ключевое слово:', word, 'пользователь:', ownerLogin)
    console.log('Сгенерированный timestamp:', timestamp, 'пользователь:', ownerLogin)

    localStorage.removeItem(login)
    localStorage.setItem(login, JSON.stringify({...findedUser, word, timestamp}))

    console.log('Отправка sha1(word)', sha1(word), 'пользователь:', ownerLogin)
  
    socket.current?.send(JSON.stringify({
      event: 'private-message',
      login: ownerLogin,
      message: sha1(word),
      to: login,
      type: 'code-word'
    }))
  }

  const handleCheckCodeWord = (message, socket) => {
    const ownerLogin = JSON.parse(localStorage.getItem('owner')).login
    const password = JSON.parse(localStorage.getItem('owner')).password

    const passwordHash = sha1(password)

    const H = sha1(passwordHash + message.message)

    console.log('H:', H, 'пользователь:', ownerLogin)

    socket.current?.send(JSON.stringify({
      event: 'private-message',
      login: ownerLogin,
      message: H,
      to: message.login,
      type: 'H'
    }))
  }

  const handleCheckH = (message, socket) => {
    const ownerLogin = JSON.parse(localStorage.getItem('owner')).login
    const findedUser = JSON.parse(localStorage.getItem(message.login))

    const passwordHash = sha1(findedUser.password)

    const ownerH = sha1(passwordHash + sha1(findedUser.word))
    console.log('H`', ownerH, 'H', message.message, 'пользователь:', ownerLogin)
    console.log('timestamp (дата генерации word + 10мин)в мс:', findedUser.timestamp, 'Текущее время в мс:', Date.now())


    if (ownerH === message.message && findedUser.timestamp >= Date.now()) {
      console.log('Соединение успешно установлено!')
      setCompanionLogin(message.login)
      status.current = true
      socket.current?.send(JSON.stringify({
        event: 'private-message',
        login: ownerLogin,
        message: 'Соединение успешно установлено!',
        to: message.login,
        type: 'status',
        status: true
      }))
    } else {
      console.log('Соединение не удалось установить!')
      socket.current?.send(JSON.stringify({
        event: 'private-message',
        login: ownerLogin,
        message: 'Соединение не удалось установить!',
        to: message.login,
        type: 'status',
        status: false
      }))
    }
  }

  const handleStatus = (message, socket) => {
    const ownerLogin = JSON.parse(localStorage.getItem('owner')).login
    console.log(message.message)

    if (message.status) {
      status.current = true
      socket.current?.send(JSON.stringify({
        event: 'private-message',
        login: ownerLogin,
        to: message.login,
        type: 'create-DH'
      }))
    }
  }

  const handleCreateDH = (message, socket) => {
    const ownerLogin = JSON.parse(localStorage.getItem('owner')).login
    const {g, p, publicKey, privateKey} = diffieHellman()
    console.log('g', g.toString(), 'p', p.toString(), 'publicKey', publicKey.toString(),
     'privateKey', privateKey.toString(), 'пользователь:', ownerLogin.toString())

    pRef.current = p
    diffieHellmanSecretKeyRef.current = privateKey

    socket.current?.send(JSON.stringify({
      event: 'private-message',
      login: ownerLogin,
      to: message.login,
      publicKey,
      g,
      p,
      type: 'create-public-key'
    }))    
  }

  const handleCreatePublicKey = (message, socket) => {
    const ownerLogin = JSON.parse(localStorage.getItem('owner')).login

    const privateKey = generateRandomBigInt(512)

    console.log('privateKey', privateKey.toString(), 'пользователь:', ownerLogin)

    diffieHellmanSecretKeyRef.current = privateKey
    
    const publicKey = getPublicKey(bigInt(message.g), privateKey, bigInt(message.p))

    console.log('publicKey', publicKey.toString(), 'пользователь:', ownerLogin)


    const sessionKey = getSessionKey(bigInt(message.publicKey), privateKey, bigInt(message.p))
    sessionKey.current = sessionKey

    console.log('sessionKey', sessionKey.toString(), 'пользователь:', ownerLogin)


    socket.current?.send(JSON.stringify({
      event: 'private-message',
      login: ownerLogin,
      to: message.login,
      publicKey,
      type: 'create-session-key'
    }))
  }

  const handleCreateSessionKey = (message, socket) => {
    const ownerLogin = JSON.parse(localStorage.getItem('owner')).login

    const sessionKey = getSessionKey(bigInt(message.publicKey), diffieHellmanSecretKeyRef.current, bigInt(pRef.current))
    console.log('sessionKey', sessionKey.toString(), 'пользователь:', ownerLogin)
    sessionKey.current = sessionKey

    // socket.current?.send(JSON.stringify({
    //   event: 'private-message',
    //   login: ownerLogin,
    //   to: message.login,
    //   publicKey,
    //   type: 'create-session-key'
    // }))
  }
  
  const handleTakeMessage = (message, socket) => {
    // const ownerLogin = JSON.parse(localStorage.getItem('owner')).login
    console.log(message)

    const text = rc4Decrypt(sessionKey.current, message.cipherText)

    const ownerHCipherText = sha1(message.cipherText)

    const HCipherText = decryptRSA(message.RSAHCipherText, message.e, message.n) // H = RSA(RSAHCipherText)   

    console.log('HCipherText', HCipherText)
    console.log('ownerHCipherText', ownerHCipherText)
    
    if (HCipherText === ownerHCipherText) {
      setMessages(prev => [...prev, {login: message.login, text: text}])
    }

  }


  useEffect(() => {
    socket.current = new WebSocket("ws://localhost:5000");

    socket.current.onopen = () => {
      const message = {
        event: "private-connection",
        login: JSON.parse(localStorage.getItem('owner')).login
      };
      socket.current?.send(JSON.stringify(message));
    };

    socket.current.onmessage = ({ data }) => {
      const message = JSON.parse(data);
      // console.log(message)
      const ownerLogin = JSON.parse(localStorage.getItem('owner')).login

      if (message.to !== ownerLogin) return

      switch (message.type) {
        case 'authentication':
          handleAuthentication(message.login, socket)
          break;
        case 'code-word':
          handleCheckCodeWord(message, socket)
          break;
        case 'H':
          handleCheckH(message, socket)
          break;
        case 'status':
          handleStatus(message, socket)
          break;
        case 'create-DH': 
          if (status.current) {
            handleCreateDH(message, socket)
          }
          break;
        case 'create-public-key':
          if (status.current) {
            handleCreatePublicKey(message, socket)   
          }
        break;
        case 'create-session-key':
          if (status.current) {
            handleCreateSessionKey(message, socket)   
          }
          break;
        case 'send-message':
          if (status.current) {
            handleTakeMessage(message, socket)
          }
      }
    };


    socket.current.onclose = () => {
      console.log("Socket закрыт");
    };

    socket.current.onerror = () => {
      console.log("Socket произошла ошибка");
    };

    return () => {
      socket.current?.close();
    };
  }, [])

  const handleSendMessage = () => {
    const login = JSON.parse(localStorage.getItem('owner')).login

    if (!RSAKeys.current) {
      RSAKeys.current = getRSAKeys(512)
    }

    console.log('RSA-keys', RSAKeys.current, 'пользователь:', login)
    console.log('sessionKey', sessionKey.current.toString(), 'пользователь:', login)
    const cipherText = rc4Encrypt(sessionKey.current, inputValue)
    console.log('cipherText', cipherText, 'пользователь:', login)

    const HCipherText = sha1(cipherText)
    console.log('HCipherText', HCipherText, 'пользователь:', login)

    const RSAHCipherText = encryptRSA(HCipherText, RSAKeys.current.d, RSAKeys.current.n)
    console.log('RSAHCipherText', RSAHCipherText, 'пользователь:', login)

    const message = {
      event: "private-message",
      login,
      cipherText,
      HCipherText,
      RSAHCipherText,
      e: RSAKeys.current.e,
      n: RSAKeys.current.n,
      to: companionLogin,
      type: 'send-message'
    }

    socket.current.send(JSON.stringify(message))
    setInputValue('')

    setMessages(prev => [...prev, {login, text: inputValue}])
  }

  const handleSendToCompanionLogin = () => {
    const login = JSON.parse(localStorage.getItem('owner')).login

    const message = {
      event: "private-message",
      login,
      message: companionLogin,
      to: companionLogin,
      type: 'authentication'
    }

    socket.current.send(JSON.stringify(message))
  }

  const handleExit = () => {
    // localStorage.clear()

    navigate('/register')    
  }


  return (
    <div className='chat-page'>
      <div className='chat'>
        <div className='chat-title'>
          <Input placeholder={'Введите логин пользователя, которому хотите отправить сообщение'} 
                onChange={handleInput(setCompanionLogin)} 
                value={companionLogin}/>
          <Button text={'Выбрать'} onClick={handleSendToCompanionLogin} />
        </div>
        <div className="messages">
          {messages.map((message, index) => <Message key={index} login={message.login} text={message.text} />)}
        </div>
        <div className="chat-page-sender">
          <Input placeholder={'Сообщение'} onChange={handleInput(setInputValue)} value={inputValue} onClick={handleSendMessage}/>
          <Button text={'Отправить'} onClick={handleSendMessage}/>
        </div>
      </div>
      <div style={{display: 'flex', flexDirection: 'column'}}>
          <Button text={'Выйти'} onClick={handleExit} />
          <div className="commander-form">
            <div className='chat-page-commander-form-title'>
              Введите логин и пароль пользователя
            </div>
            <Input placeholder={'Логин'} onChange={handleInput(setUserLogin)} value={userLogin}/>
            <Input placeholder={'Пароль'} type='password' onChange={handleInput(setUserPassword)} value={userPassword}/>
            <Button text={'Отправить'}  onClick={handleAddUser}/>
          </div>
      </div>
    </div>
  );
};

export default ChatPage;