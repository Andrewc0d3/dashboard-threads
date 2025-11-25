import { supabase } from "./supabase.js";

export async function obtenerUsuarioPorId(id) {
    const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .eq("id", id)
        .single();

    return error ? null : data;
}

export async function obtenerUsuarios() {
    const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .order("creado_en", { ascending: false });

    return error ? [] : data;
}

export async function actualizarUsuario(id, datos) {
    const { data, error } = await supabase
        .from("usuarios")
        .update(datos)
        .eq("id", id)
        .select()
        .single();

    return error ? error.message : data;
}

export async function eliminarUsuario(id) {
    const { error } = await supabase
        .from("usuarios")
        .delete()
        .eq("id", id);

    return error ? error.message : "Usuario eliminado correctamente.";
}
