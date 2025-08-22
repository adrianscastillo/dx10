// Liquid Glass Effect for DX10 Logo
class LiquidGlassEffect {
    constructor(canvas, logoElement) {
        this.canvas = canvas;
        this.logoElement = logoElement;
        this.gl = null;
        this.program = null;
        this.uniforms = {};
        this.isInitialized = false;
        
        console.log('LiquidGlassEffect: Initializing...');
        this.init();
    }

    init() {
        try {
            this.gl = this.canvas.getContext("webgl", { antialias: true }) || 
                      this.canvas.getContext("experimental-webgl", { antialias: true });
            
            if (!this.gl) {
                console.error("WebGL not supported");
                return;
            }

            console.log('LiquidGlassEffect: WebGL context created successfully');
            this.setupShaders();
            this.setupBuffers();
            this.setupUniforms();
            this.resize();
            this.isInitialized = true;
            console.log('LiquidGlassEffect: Initialization complete');
        } catch (error) {
            console.error('LiquidGlassEffect: Initialization failed:', error);
        }
    }

    setupShaders() {
        const vertexShaderSource = `
            attribute vec2 a_position;
            varying vec2 v_uv;
            void main() {
                v_uv = vec2(a_position.x, -a_position.y) * 0.5 + 0.5;
                gl_Position = vec4(a_position, 0.0, 1.0);
            }
        `;

        const fragmentShaderSource = `
            precision mediump float;
            uniform float u_dpr;
            uniform sampler2D u_background;
            uniform vec2 u_resolution;
            uniform vec2 u_mouse;
            uniform vec2 u_size;
            uniform vec2 u_logoPosition;
            uniform vec2 u_logoSize;
            varying vec2 v_uv;

            float cssPxUV() {
                return u_dpr / min(u_resolution.x, u_resolution.y);
            }

            float roundedBox(vec2 uv, vec2 center, vec2 size, float radius) {
                vec2 q = abs(uv - center) - size + radius;
                return length(max(q, 0.0)) - radius;
            }

            vec3 blurBackground(vec2 uv, vec2 resolution) {
                vec3 result = vec3(0.0);
                float total = 0.0;
                float radius = 3.0;
                for (int x = -3; x <= 3; x++) {
                    for (int y = -3; y <= 3; y++) {
                        vec2 offset = vec2(float(x), float(y)) * 2.0 / resolution;
                        float weight = exp(-(float(x * x + y * y)) / (2.0 * radius));
                        result += texture2D(u_background, uv + offset).rgb * weight;
                        total += weight;
                    }
                }
                return result / total;
            }

            float roundedBoxSDF(vec2 p, vec2 b, float r) {
                vec2 d = abs(p) - b + vec2(r);
                return length(max(d, 0.0)) - r;
            }

            vec2 getNormal(vec2 uv, vec2 center, vec2 size, float radius) {
                vec2 eps = vec2(1.0) / u_resolution * 2.0;
                vec2 p = uv - center;

                float sdfCenter = roundedBoxSDF(p, size, radius);
                float dx = (roundedBoxSDF(p + vec2(eps.x, 0.0), size, radius) - roundedBoxSDF(p - vec2(eps.x, 0.0), size, radius)) * 0.5;
                float dy = (roundedBoxSDF(p + vec2(0.0, eps.y), size, radius) - roundedBoxSDF(p - vec2(0.0, eps.y), size, radius)) * 0.5;

                vec2 gradient = vec2(dx, dy);
                float dxy1 = roundedBoxSDF(p + eps, size, radius);
                float dxy2 = roundedBoxSDF(p - eps, size, radius);
                vec2 diag = vec2(dxy1 - dxy2);
                gradient = mix(gradient, diag, 0.25);

                if (length(gradient) < 0.001) {
                    return vec2(0.0);
                }
                return normalize(gradient);
            }

            void main() {
                vec2 pixelUV = (v_uv * u_resolution) / u_dpr;
                vec2 center = u_logoPosition;
                vec2 size = u_logoSize * 0.5;

                vec2 local = (pixelUV - center) / size;
                local.y *= u_resolution.x / u_resolution.y;

                float radius = 20.0;
                float dist = roundedBox(pixelUV, center, size, radius);

                if (dist > 1.0) {
                    gl_FragColor = texture2D(u_background, v_uv);
                    return;
                }

                // Radial curvature refraction
                float r = clamp(length(local * 1.0), 0.0, 1.0);
                float curvature = pow(r, 1.0);
                vec2 domeNormal = normalize(local) * curvature;
                float eta = 1.0 / 1.5;
                vec2 incident = -domeNormal;
                vec2 refractVec = refract(incident, domeNormal, eta);
                vec2 curvedRefractUV = v_uv + refractVec * 0.03;

                // Edge contour refraction
                float contourFalloff = exp(-abs(dist) * 0.4);
                vec2 normal = getNormal(pixelUV, center, size, radius);
                vec2 domeNormalContour = normal * pow(contourFalloff, 1.5);
                vec2 refractVecContour = refract(vec2(0.0), domeNormalContour, eta);
                vec2 uvContour = v_uv + refractVecContour * 0.35 * contourFalloff;

                float edgeWeight = smoothstep(0.0, 1.0, abs(dist));
                float radialWeight = smoothstep(0.5, 1.0, r);
                float combinedWeight = clamp((edgeWeight * 1.0) + (-radialWeight * 0.5), 0.0, 1.0);
                vec2 refractUV = mix(curvedRefractUV, uvContour, combinedWeight);

                vec3 refracted = texture2D(u_background, refractUV).rgb;
                vec3 blurred = blurBackground(refractUV, u_resolution);
                vec3 base = mix(refracted, blurred, 0.5);

                // Shadow
                float edgeFalloff = smoothstep(0.01, 0.0, dist);
                float verticalBand = 1.0 - smoothstep(-1.5, -0.2, local.y);
                float topShadow = edgeFalloff * verticalBand;
                vec3 shadowColor = vec3(0.0);
                base = mix(base, shadowColor, topShadow * 0.1);

                // Edge glow
                float edge = 1.0 - smoothstep(0.0, 0.03, dist * -2.0);
                vec3 glow = vec3(0.7);
                vec3 color = mix(base, glow, edge * 0.5);

                float alpha = 0.75;
                gl_FragColor = vec4(color, alpha);
            }
        `;

        const vertexShader = this.compileShader(this.gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = this.compileShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);

        if (!vertexShader || !fragmentShader) {
            throw new Error("Shader compilation failed");
        }

        this.program = this.gl.createProgram();
        this.gl.attachShader(this.program, vertexShader);
        this.gl.attachShader(this.program, fragmentShader);
        this.gl.linkProgram(this.program);

        if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
            console.error("Program link error:", this.gl.getProgramInfoLog(this.program));
        }

        this.gl.useProgram(this.program);
    }

    compileShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error("Shader compile error:", this.gl.getShaderInfoLog(shader));
            return null;
        }
        return shader;
    }

    setupBuffers() {
        const positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([
            -1, -1, 1, -1, -1, 1,
            -1, 1, 1, -1, 1, 1
        ]), this.gl.STATIC_DRAW);

        const positionLocation = this.gl.getAttribLocation(this.program, "a_position");
        this.gl.enableVertexAttribArray(positionLocation);
        this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);
    }

    setupUniforms() {
        this.uniforms = {
            resolution: this.gl.getUniformLocation(this.program, "u_resolution"),
            mouse: this.gl.getUniformLocation(this.program, "u_mouse"),
            size: this.gl.getUniformLocation(this.program, "u_size"),
            logoPosition: this.gl.getUniformLocation(this.program, "u_logoPosition"),
            logoSize: this.gl.getUniformLocation(this.program, "u_logoSize"),
            dpr: this.gl.getUniformLocation(this.program, "u_dpr"),
            background: this.gl.getUniformLocation(this.program, "u_background")
        };
    }

    resize() {
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = window.innerWidth * dpr;
        this.canvas.height = window.innerHeight * dpr;
        this.canvas.style.width = window.innerWidth + 'px';
        this.canvas.style.height = window.innerHeight + 'px';
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }

    updateLogoPosition() {
        if (!this.logoElement) return;
        
        const rect = this.logoElement.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        
        return {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
            width: rect.width,
            height: rect.height
        };
    }

    render() {
        if (!this.isInitialized) return;

        const logoPos = this.updateLogoPosition();
        const dpr = window.devicePixelRatio || 1;

        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.gl.uniform2f(this.uniforms.resolution, this.canvas.width, this.canvas.height);
        this.gl.uniform2f(this.uniforms.logoPosition, logoPos.x * dpr, logoPos.y * dpr);
        this.gl.uniform2f(this.uniforms.logoSize, logoPos.width * dpr, logoPos.height * dpr);
        this.gl.uniform1f(this.uniforms.dpr, dpr);
        
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    }

    setBackground(texture) {
        if (!this.isInitialized) return;
        
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        this.gl.uniform1i(this.uniforms.background, 0);
    }
}
