# Importar los módulos necesarios
import ubluetooth
from machine import Pin, SPI
import BLE
from max7219 import Max7219
import time


# Configurar un Pin como LED
led=Pin(2,Pin.OUT)

# Configurar una matriz LED de 32x8 píxeles
spi=SPI(1, baudrate=10000000, polarity=1, phase=0, sck=Pin(19), mosi=Pin(23))
cs=Pin(18)
display=Max7219(32,8, spi, cs, False)   #False o True Gira 180°
display.setMatrizGrande(False)

# Configurar Bluetooth
nombre='ESP32'
ble=ubluetooth.BLE()
uart=BLE.BLEUART(ble,nombre)

# Configurar banderas (flags)
invertido=False
esMarquee=False
saludoDado=False

# Texto a mostrar en la matriz LED
texto="hola";

# Esperar 1 segundo antes de comenzar el bucle principal
time.sleep_ms(1000)

# Bucle principal
while True:

    # Esperar hasta que haya una conexión Bluetooth
    while len(uart._connections) == 0:
        display.setMarqueeSpeed(40)
        texto="hola"
        invertido=False
        esMarquee=False
        display.brightness(0)
        display.fill(0)
        display.marquee("Esperando conexion...",0)
    
    # Mostrar el texto en la matriz LED
    display.fill(invertido)
    if esMarquee:
        display.marquee(texto,invertido)
    else:
        display.mostrarTexto(texto,0,0,invertido)
    
    # Recibir mensajes a través de Bluetooth
    if uart.any()!=0:
        comando = uart.read().decode().strip()
        print(comando)
        uart.write('ESP32 dice: ' + str(comando) + '\n')
        
        # Si el mensaje comienza con "|", es un comando de configuración
        if comando and comando[0] == '|':
            if comando == '|Invertir':
                # Cambiar los colores del texto
                invertido = not invertido
            elif comando == '|Marquee':
                # Activar o desactivar el modo marquesina
                esMarquee = not esMarquee
            elif comando.startswith('|Velocidad'):
                # Cambiar la velocidad de la marquesina
                valorVelocidad=comando.split('|')[2]
                display.setMarqueeSpeed(int(valorVelocidad))
            elif comando.startswith('|Brillo'):
                # Cambiar el brillo de la matriz LED
                valorBrillo=comando.split('|')[2]
                display.brightness(int(valorBrillo))
                time.sleep_ms(10)
            elif comando == ('|tamanoGrande'):
                # Cambiar el tamaño de la matriz LED a 32x16
                display=Max7219(32,16, spi, cs, False)
                display.setMatrizGrande(True)
            elif comando == ('|tamanoChico'):
                # Cambiar el tamaño de la matriz LED a 32x8
                display=Max7219(32,8, spi, cs, False)
                display.setMatrizGrande(False)
            elif comando == '|Reiniciar':
                # Reiniciar la matriz LED
                if display.isMatrizGrande():
                    display=Max7219(32,16, spi, cs, False)
                    display.setMatrizGrande(True)
                else:
                    display=Max7219(32,8, spi, cs, False)
        else:
            # Si no es un comando, asumimos que es texto y lo mostramos
            texto=str(comando)
    time.sleep_ms(5)