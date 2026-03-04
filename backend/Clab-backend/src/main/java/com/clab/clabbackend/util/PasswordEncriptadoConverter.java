package com.clab.clabbackend.util;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Converter
@Component
public class PasswordEncriptadoConverter implements AttributeConverter<String, String> {

    private static String secreto;

    @Value("${clab.encryption.secret}")
    public void setSecreto(String s) {
        PasswordEncriptadoConverter.secreto = s;
    }

    @Override
    public String convertToDatabaseColumn(String textoPlano) {
        if (textoPlano == null || textoPlano.isBlank()) return textoPlano;
        return EncriptadorAES.encriptar(textoPlano, secreto);
    }

    @Override
    public String convertToEntityAttribute(String textoEncriptado) {
        if (textoEncriptado == null || textoEncriptado.isBlank()) return textoEncriptado;
        return EncriptadorAES.desencriptar(textoEncriptado, secreto);
    }
}