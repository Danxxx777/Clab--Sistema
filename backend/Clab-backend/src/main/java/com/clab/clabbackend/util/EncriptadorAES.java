package com.clab.clabbackend.util;

import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Arrays;
import java.util.Base64;

public class EncriptadorAES {

    private static final String ALGORITMO = "AES/CBC/PKCS5Padding";
    private static final byte[] IV = "CLab2026IVFixed!".getBytes(StandardCharsets.UTF_8);

    private static SecretKeySpec generarClave(String secreto) throws Exception {
        MessageDigest sha = MessageDigest.getInstance("SHA-256");
        byte[] claveBytes = sha.digest(secreto.getBytes(StandardCharsets.UTF_8));
        claveBytes = Arrays.copyOf(claveBytes, 32);
        return new SecretKeySpec(claveBytes, "AES");
    }

    public static String encriptar(String textoPlano, String secreto) {
        try {
            SecretKeySpec clave = generarClave(secreto);
            Cipher cipher = Cipher.getInstance(ALGORITMO);
            cipher.init(Cipher.ENCRYPT_MODE, clave, new IvParameterSpec(IV));
            byte[] encriptado = cipher.doFinal(textoPlano.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(encriptado);
        } catch (Exception e) {
            throw new RuntimeException("Error al encriptar contraseña", e);
        }
    }

    public static String desencriptar(String textoEncriptado, String secreto) {
        try {
            SecretKeySpec clave = generarClave(secreto);
            Cipher cipher = Cipher.getInstance(ALGORITMO);
            cipher.init(Cipher.DECRYPT_MODE, clave, new IvParameterSpec(IV));
            byte[] decoded = Base64.getDecoder().decode(textoEncriptado);
            return new String(cipher.doFinal(decoded), StandardCharsets.UTF_8);
        } catch (Exception e) {
            // Contraseña vieja en texto plano — la devuelve tal cual
            return textoEncriptado;
        }
    }
}