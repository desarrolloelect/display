import ubluetooth
from machine import Pin, SPI
import BLE
from max7219 import Max7219
import time

led=Pin(2,Pin.OUT)

#matriz 32x16
spi=SPI(1, baudrate=10000000, polarity=1, phase=0, sck=Pin(19), mosi=Pin(23))
cs=Pin(18)
display=Max7219(32,8, spi, cs, False)   #False o True Gira 180°
display.setMatrizGrande(False)

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
        display.setMarqueeSpeed(40)
        texto="hola"
        invertido=False
        esMarquee=False
        display.brightness(0) #Brillo de 0 a 15
        display.fill(0)
        display.marquee("Esperando conexion...",0)
    
    
    
    #impresion del texto
    display.fill(invertido)
    if esMarquee:
        display.marquee(texto,invertido)
    else:
        display.mostrarTexto(texto,0,0,invertido)
    
        
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
                display.setMarqueeSpeed(int(valorVelocidad))
            elif comando.startswith('|Brillo'):
                valorBrillo=comando.split('|')[2]
                display.brightness(int(valorBrillo))
                time.sleep_ms(10)
            elif comando == ('|tamanoGrande'):
                display=Max7219(32,16, spi, cs, False)
                display.setMatrizGrande(True)
            elif comando == ('|tamanoChico'):
                display=Max7219(32,8, spi, cs, False)
                display.setMatrizGrande(False)
            elif comando == '|Reiniciar':
                print(display.isMatrizGrande())
                if display.isMatrizGrande():
                    display=Max7219(32,16, spi, cs, False)
                    display.setMatrizGrande(True)
                else:
                    display=Max7219(32,8, spi, cs, False)
        else:
            texto=str(comando)
    time.sleep_ms(5)