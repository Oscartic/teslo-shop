import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Repository } from 'typeorm';

import { User } from '../auth/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';

interface ConnectedClients {
    [id: string]: { 
        socket: Socket;
        user: User;
    }
}

@Injectable()
export class MessagesWsService {

    private connectedClients: ConnectedClients = {};

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>
    ) {}
    async registerClient(client: Socket, userId: string) {
        const user = await this.userRepository.findOneBy({ id: userId });
        if (!user) throw new Error('User not found');
        if (!user.isActive) throw new Error('User is not active');

        this.checkUserConnection(user);
        
        this.connectedClients[client.id] = {
            socket: client,
            user: user
        };
    }

    removeClient(client: Socket) {
        delete this.connectedClients[client.id];
    }

    getConnectedClients() {
        console.log(this.connectedClients);
        return Object.keys(this.connectedClients);
    }

    getUserFullName(clientId: string) {
        const client = this.connectedClients[clientId].user.fullName;
        return client ? client : null;
    }

    private checkUserConnection(user: User) {
        const isConnected = Object.values(this.connectedClients).some(client => client.user.id === user.id);
        if(isConnected) {
            const connectedClient = Object.values(this.connectedClients).find(client => client.user.id === user.id);
            if(connectedClient) {
                connectedClient.socket.disconnect();
                return; // exit the function after disconnecting the client
            }
        }
    }
}
