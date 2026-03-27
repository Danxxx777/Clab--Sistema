package com.clab.clabbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FotoDTO {
    private Integer idFoto;
    private LocalDate fechaSubida;
    private String urlFoto;
    private String publicId;
    private String estado;
}
