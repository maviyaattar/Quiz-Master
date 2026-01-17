const API="https://quiz-backend-production-4aaf.up.railway.app";

/* AUTH SWITCH */
function switchAuth(type){
  loginForm.style.display=type==="login"?"block":"none";
  registerForm.style.display=type==="register"?"block":"none";

  loginTab.classList.toggle("active",type==="login");
  registerTab.classList.toggle("active",type==="register");
}

/* LOGIN */
async function login(e){
  e.preventDefault();
  msg.innerText="Logging in...";
  try{
    const res=await fetch(API+"/api/auth/login",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        email:email.value,
        password:password.value
      })
    });
    const data=await res.json();
    if(!res.ok){msg.innerText=data.msg;return;}
    localStorage.setItem("token",data.token);
    msg.innerText="Login successful";
    setTimeout(()=>location.href="dashboard.html",700);
  }catch{
    msg.innerText="Server error";
  }
}

/* REGISTER */
async function registerUser(e){
  e.preventDefault();
  msg.innerText="Creating account...";
  try{
    const res=await fetch(API+"/api/auth/register",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        name:rname.value,
        email:remail.value,
        password:rpassword.value
      })
    });
    const data=await res.json();
    msg.innerText=data.msg||"Registered successfully";
    switchAuth("login");
  }catch{
    msg.innerText="Server error";
  }
}



