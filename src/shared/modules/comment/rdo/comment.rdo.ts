import { Expose, Type } from 'class-transformer';
import { UserRdo } from '../../user/index.js';

export class CommentRdo {
  @Expose({ name: '_id' })
  public id!: string;

  @Expose()
  public text!: string;

  @Expose()
  @Expose({ name: 'createdAt' })
  public datePublication!: Date;

  @Expose()
  public rating!: number;

  @Expose({ name: 'authorId' })
  @Type(() => UserRdo)
  public author!: UserRdo;
}
