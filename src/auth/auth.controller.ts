import { Controller, Get, Post, Body, UseGuards, Req, SetMetadata } from '@nestjs/common';
import { UserRoleGuard } from './guards/user-role.guard';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';
import { GetUser } from './decorators/get-user.decorator';
import { User } from './entities/user.entity';
import { Auth, RoleProtected } from './decorators';
import { ValidRoles } from './interfaces';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

    @Get('check-status')
    @Auth()
    checkAuthStatus(
      @GetUser() user: User,
    ) {
      return  this.authService.checkAuthStatus(user);
    }

  @Get('profile')
  @UseGuards(AuthGuard())
  getProfile(
    // @Req() request: Express.Request,
    @GetUser() user: User,
    @GetUser('email') email: string,
  ) {
    console.log(user);
    return { 
      user,
      email,
      message: 'Profile endpoint not implemented yet',
    };
  }

  // Use authorization and authentication separately.
  @Get('private-role')
  @RoleProtected(ValidRoles.ADMIN)
  // @SetMetadata('roles', ['admin']) // this replace with @RoleProtected(validRoles.ADMIN) 
  @UseGuards(AuthGuard(), UserRoleGuard)
  getPrivateRole(
    @GetUser() user: User
  ) {
    return {
      user,
      message: 'Private role endpoint not implemented yet',
    };
  }

  @Get('private-compose')
  @Auth(ValidRoles.ADMIN)
  getPrivateCompose(
    @GetUser() user: User
  ){
    return {
      user,
      message: 'Private compose endpoint not implemented yet',
    };
  }  
}
