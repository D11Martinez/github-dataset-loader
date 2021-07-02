import { Controller, Get, Header } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Header('content-type', 'application/json')
  getHello(): any {
    return this.appService.getHello();
  }

  @Get('import')
  @Header('content-type', 'application/json')
  getImport(): any {
    return this.appService.import();
  }
}
