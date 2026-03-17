package com.tienda.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/seguridad")
@CrossOrigin(origins = "*")
public class SeguridadController {

    @Autowired
    private JavaMailSender mailSender;

    // Para empezar rápido, guardaremos el PIN en la memoria del servidor.
    // (Más adelante podemos moverlo a la base de datos de PostgreSQL)
    private String pinActual = "1234";

    @PostMapping("/verificar")
    public boolean verificarPin(@RequestBody Map<String, String> payload) {
        return pinActual.equals(payload.get("pin"));
    }

    @PostMapping("/cambiar")
    public boolean cambiarPin(@RequestBody Map<String, String> payload) {
        String nuevoPin = payload.get("nuevoPin");

        if (nuevoPin != null && nuevoPin.length() >= 4) {
            this.pinActual = nuevoPin;
            enviarCorreoAlerta(nuevoPin);
            return true;
        }
        return false;
    }

    private void enviarCorreoAlerta(String nuevoPin) {
        try {
            SimpleMailMessage mensaje = new SimpleMailMessage();
            mensaje.setTo("eviljjmz@gmail.com");
            mensaje.setSubject("🚨 ALERTA: Cambio de PIN en Los Chilangos");
            mensaje.setText("Hola,\n\n" +
                    "El PIN de acceso al sistema de Punto de Venta ha sido modificado el " + LocalDateTime.now() + ".\n\n" +
                    "El nuevo PIN de seguridad es: " + nuevoPin + "\n\n" +
                    "Si tú no hiciste este cambio, revisa el sistema inmediatamente.");

            mailSender.send(mensaje);
        } catch (Exception e) {
            System.out.println("No se pudo enviar el correo de alerta: " + e.getMessage());
        }
    }
}