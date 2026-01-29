// Load environment variables
require('dotenv').config();
const crypto = require('node:crypto');

const config = {
    server: {
        secret: process.env.SESSION_SECRET || crypto.randomBytes(64).toString('hex'),
        port : process.env.PORT || 3333
    },
    rtmp_server: {
        rtmp: {
            port: process.env.RTMP_PORT || 1935,
            chunk_size: 60000,
            gop_cache: true,
            ping: 60,
            ping_timeout: 30
        },
        http: {
            port: process.env.RTMP_HTTP_PORT || 8888,
            mediaroot: './server/media',
            allow_origin: process.env.CORS_ORIGIN || (process.env.NODE_ENV === 'production' ? 'https://yourdomain.com' : '*')
        },
        trans: {
            ffmpeg: process.env.FFMPEG_PATH || '/usr/bin/ffmpeg',
            tasks: [
                {
                    app: 'live',
                    hls: true,
                    hlsFlags: '[hls_time=2:hls_list_size=3:hls_flags=delete_segments]',
                    dash: true,
                    dashFlags: '[f=dash:window_size=3:extra_window_size=5]'
                }
            ]
        }
    }
};

module.exports = config;