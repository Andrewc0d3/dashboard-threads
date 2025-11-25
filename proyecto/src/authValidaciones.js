// src/authValidaciones.js

import { supabase } from "./supabase.js";

// Almacenamiento local para intentos
function getDatosLogin() {
    return JSON.parse(localStorage.getItem("datosLogin")) || {};
}

function setDatosLogin(data) {
    localStorage.setItem("datosLogin", JSON.stringify(data));
}

// ---------------- REGISTRO ----------------
export async function registrarUsuarioSeguro(username, email, password, confirmarPassword, telefono) {

    if (!username || !email || !password || !confirmarPassword) {
        return { error: "Todos los campos son obligatorios." };
    }

    if (password !== confirmarPassword) {
        return { error: "Las contraseñas no coinciden." };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { error: "Correo electrónico inválido." };
    }

    if (password.length < 6) {
        return { error: "La contraseña debe tener al menos 6 caracteres." };
    }

    const { data: existeUsuario } = await supabase
        .from("estudiantes")
        .select("id")
        .or(`correo.eq.${email},nombre.eq.${username}`);

    if (existeUsuario.length > 0) {
        return { error: "El usuario o correo ya está registrado." };
    }

    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password
    });

    if (error) {
        return { error: error.message };
    }

    const uid = data.user.id;

    const { error: insertError } = await supabase.from("estudiantes").insert([{
        id: uid,
        nombre: username,
        correo: email,
        telefono
    }]);

    if (insertError) {
        return { error: insertError.message };
    }

    return { success: true, mensaje: "Registro exitoso. Revisa tu correo para confirmar." };
}

// ---------------- LOGIN ----------------
export async function iniciarSesionSeguro(email, password) {
    if (!email || !password) {
        return { error: "Ingresa el correo y la contraseña." };
    }

    let datosSesion = getDatosLogin();

    const ahora = Date.now();
    const intentos = datosSesion[email]?.intentos || 0;
    const bloqueo = datosSesion[email]?.bloqueadoHasta || 0;

    if (ahora < bloqueo) {
        return { error: "Demasiados intentos. Intenta más tarde." };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {

        const nuevosIntentos = intentos + 1;
        let nuevoBloqueo = 0;

        if (nuevosIntentos >= 3) {
            nuevoBloqueo = Date.now() + 30000; // 30 segundos
        }

        datosSesion[email] = {
            intentos: nuevosIntentos,
            bloqueadoHasta: nuevoBloqueo
        };

        setDatosLogin(datosSesion);

        return { error: "Correo o contraseña incorrectos." };
    }

    datosSesion[email] = {
        intentos: 0,
        bloqueadoHasta: 0
    };
    setDatosLogin(datosSesion);

    return {
        success: true,
        user: data.user
    };
}
