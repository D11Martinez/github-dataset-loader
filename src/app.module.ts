import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {
  PullRequestEvent,
  PullRequestEventSchema,
} from './schemas/github-event.schema';
@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot('mongodb://localhost/GitHubDB'),
    MongooseModule.forFeature([
      { name: PullRequestEvent.name, schema: PullRequestEventSchema },
    ]),
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
