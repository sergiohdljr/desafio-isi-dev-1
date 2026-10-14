import { Controller, Get } from '@nestjs/common';
import { HelloService } from './hello.service.js';

@Controller()
export class HelloController {
  constructor(private readonly helloService: HelloService) {}

  @Get()
  getHello(): string {
    return this.helloService.getHello();
  }
}
