from flask import Flask, request, jsonify, render_template

app = Flask(__name__, template_folder='templates', static_folder='static')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate', methods=['POST'])
def generate():
    data = request.get_json()
    try:
        o1 = int(data['o1'])
        o2 = int(data['o2'])
        o3 = int(data['o3'])
        o4 = int(data['o4'])
        clase = data['clase']
        cantidad = int(data['cantidad'])
    except (ValueError, KeyError):
        return jsonify({"error": "Datos incompletos o inválidos"}), 400

    # 1. Validar rangos 0-255
    for idx, val in enumerate([o1, o2, o3, o4], 1):
        if not (0 <= val <= 255):
            return jsonify({"error": f"Octeto {idx} fuera de rango"}), 400

    # 2. Determinar clase real (Sin Clase D)
    if 1 <= o1 <= 126: claseReal = "A"
    elif 128 <= o1 <= 191: claseReal = "B"
    elif 192 <= o1 <= 223: claseReal = "C"
    else: claseReal = "E"

    # 3. Verificar coincidencia
    if claseReal != clase:
        return jsonify({"error": f"IP es Clase {claseReal}"}), 400
    if cantidad < 1:
        return jsonify({"error": "Cantidad inválida"}), 400

    # 4. Máscaras de Subred Específicas (Corrección Lógica)
    if clase == "A":
        subnet_mask = "255.255.0.0"      # /16
    elif clase == "B":
        subnet_mask = "255.255.240.0"    # /20
    elif clase == "C":
        subnet_mask = "255.255.255.192"  # /26
    else:
        subnet_mask = "0.0.0.0"
        
    results = []
    numSubnet = 1

    # 5. SUBNETTING
    for _ in range(cantidad):
        s1, s2, s3, s4 = o1, o2, o3, o4
        
        if clase == "A":
            s2 += (numSubnet - 1)
            if s2 > 255: break
            subnet, first, last, bc = f"{s1}.{s2}.0.0", f"{s1}.{s2}.0.1", f"{s1}.{s2}.255.254", f"{s1}.{s2}.255.255"
            
        elif clase == "B":
            s3 = (numSubnet - 1) * 16
            while s3 > 255: s3 -= 256; s2 += 1
            subnet, first, last, bc = f"{s1}.{s2}.{s3}.0", f"{s1}.{s2}.{s3}.1", f"{s1}.{s2}.{s3+15}.254", f"{s1}.{s2}.{s3+15}.255"
            
        elif clase == "C":
            s4 = (numSubnet - 1) * 64
            while s4 > 255:
                s4 -= 256; s3 += 1
                if s3 > 255: s3 = 0; s2 += 1
            subnet, first, last, bc = f"{s1}.{s2}.{s3}.{s4}", f"{s1}.{s2}.{s3}.{s4+1}", f"{s1}.{s2}.{s3}.{s4+62}", f"{s1}.{s2}.{s3}.{s4+63}"

        results.append({"num": numSubnet, "subnet": subnet, "mask": subnet_mask, "first": first, "last": last, "broadcast": bc})
        numSubnet += 1
        
        if clase == "C" and numSubnet > 4: break
        if clase == "B" and s3 > 255: break
        if clase == "A" and s2 > 255: break

    return jsonify({"results": results, "generated": len(results)})

if __name__ == '__main__':
    app.run(debug=True, port=5000)