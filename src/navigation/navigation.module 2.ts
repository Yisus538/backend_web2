import { Module } from '@nestjs/common';
import { NavService } from './nav.service';

@Module({
  providers: [NavService],
  exports:   [NavService],
})
export class NavigationModule {}
