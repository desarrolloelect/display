import ubluetooth
from machine import Pin, SPI
import BLE
from max7219 import Max7219
import time

led=Pin(2,Pin.OUT)

#matriz 32x8
spi=SPI(1, baudrate=10000000, polarity=1, phase=0, sck=Pin(19), mosi=Pin(23))
cs=Pin(18)
dis8x32=Max7219(32,16, spi, cs, False)   #False o True Gira 180°

#Bluetooth
nombre='ESP32'
ble=ubluetooth.BLE()
uart=BLE.BLEUART(ble,nombre)

#banderas
invertido=False
esMarquee=False
saludoDado=False

texto="hola";
time.sleep_ms(1000)

while True:
    #esperando conexion
    while len(uart._connections) == 0:
        dis8x32.setMarqueeSpeed(40)
        texto="hola"
        invertido=False
        esMarquee=False
        dis8x32.brightness(0) #Brillo de 0 a 15
        dis8x32.fill(0)
        dis8x32.marquee("Esperando conexion...",0)
    
    #impresion del texto
    dis8x32.fill(invertido)
    if esMarquee:
        dis8x32.marquee(texto,invertido)
    else:
        dis8x32.mostrarTexto(texto,0,4,invertido)
    
        
    #recibir mensajes
    if uart.any()!=0:
        comando = uart.read().decode().strip()
        print(comando)
        uart.write('ESP32 dice: ' + str(comando) + '\n')
        
        if comando and comando[0] == '|': #es un comando de configuracion            
            if comando == '|Invertir':
                invertido = not invertido
            elif comando == '|Marquee':
                esMarquee = not esMarquee
            elif comando.startswith('|Velocidad'):
                valorVelocidad=comando.split('|')[2]
                dis8x32.setMarqueeSpeed(int(valorVelocidad))
            elif comando.startswith('|Brillo'):
                valorBrillo=comando.split('|')[2]
                dis8x32.brightness(int(valorBrillo))
                time.sleep_ms(10)
        else:
            texto=str(comando)
    time.sleep_ms(5)