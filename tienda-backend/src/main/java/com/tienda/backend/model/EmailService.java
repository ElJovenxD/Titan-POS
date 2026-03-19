package com.tienda.backend.model;

import com.tienda.backend.repository.ConfiguracionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSenderImpl mailSender;

    @Autowired
    private ConfiguracionRepository configRepo;

    public void enviarAlerta(String mensaje) {
        // Sacamos la configuración de forma dinámica (el primer registro que exista)
        Configuracion config = configRepo.findAll().stream().findFirst().orElse(null);


        if (config != null && config.getCorreoAlertas() != null && config.getPasswordCorreo() != null) {
            SimpleMailMessage email = new SimpleMailMessage();
            email.setTo(config.getCorreoAlertas());
            email.setSubject("⚠️ Alerta de Seguridad - " + config.getNombreTienda());
            email.setText(mensaje);

            // CONFIGURACIÓN DINÁMICA
            mailSender.setUsername(config.getCorreoAlertas()); // Usa el correo del usuario
            mailSender.setPassword(config.getPasswordCorreo()); // Usa la clave que el usuario guardó

            mailSender.send(email);
        }
    }
}
