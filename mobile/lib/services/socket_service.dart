import 'api_service.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;

const String _socketUrl = 'https://uknighted.onrender.com';

class SocketService {
  static io.Socket? _socket;

  static Future<void> connect(String userId) async {
    final token = await ApiService.getToken();
    if (token == null) return;

    _socket = io.io(
      _socketUrl,
      io.OptionBuilder()
        .setTransports(['websocket'])
        .setAuth({'token': token})
        .build()
    );

    _socket!.onConnect((_) {
      _socket!.emit('user:online', userId);
    });
  }

  static void disconnect() {
    _socket?.disconnect();
    _socket = null;
  }
}