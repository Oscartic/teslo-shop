import { WebSocketGateway } from '@nestjs/websockets';
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketServer } from '@nestjs/websockets';
import { JwtPayload } from '../auth/interfaces'; 
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { MessagesWsService } from './messages-ws.service';
import { SubscribeMessage } from '@nestjs/websockets';
import { NewMessageDto } from './dto/new-message.dto';


@WebSocketGateway({ cors: true })
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  
  @WebSocketServer() wss!: Server;

  constructor(
    private readonly messagesWsService: MessagesWsService,
    private readonly jwtService: JwtService
  ) {}

  async handleConnection(client: Socket, ...args: any[]) {
    
    const token = client.handshake.headers.authorization?.split(' ')[1] as string; // this extracts the token from the "Bearer <token>" format
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify(token);
      await this.messagesWsService.registerClient(client, payload.id); 
    } catch (error) {
      client.disconnect();
      // console.log({ error: error });
      return 
    }
    // console.log(payload)


    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients());
  }

  handleDisconnect(client: Socket) {
    this.messagesWsService.removeClient(client);
    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients());
  } 

  @SubscribeMessage('message-from-client')
  handleMessage(client: Socket, payload: NewMessageDto) {
    
    // Emit the message to the client itself
    // client.emit('message-from-server', {
    //   fullname: 'Anonymous',
    //   message: payload.message,
    //   clientId: client.id
    // });
    
    // emit the message to all connected clients less the sender
    // client.broadcast.emit('message-from-server', {
    //   fullname: 'Anonymous',
    //   message: payload.message,
    // });

    // Emit the updated list of connected clients to all clients
    console.log({ message: payload.message });
    this.wss.emit('message-from-server', { 
      fullName: this.messagesWsService.getUserFullName(client.id),
      message: payload.message
    });
  }
}
