document.addEventListener("DOMContentLoaded", ()=>{
    var button = document.createElement("button");
    button.textContent ="Auth";
    document.body.appendChild(button);

    btn.addEventListener("click",()=>{
        window.location.href='http://localhost:3000/auth/'
    });
})