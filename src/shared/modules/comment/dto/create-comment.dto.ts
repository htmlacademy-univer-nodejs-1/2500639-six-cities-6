import { IsNumber, IsString, Length, Max, Min } from 'class-validator';
import { CreateCommentMessages } from './create-comment.messages.js';

export class CreateCommentDto {
  @Length(5, 1024, {message: CreateCommentMessages.text.lengthField})
  @IsString({message: CreateCommentMessages.text.invalidFormat})
  public text!: string;

  @IsNumber({}, {message: CreateCommentMessages.rating.invalidFormat})
  @Min(1, {message: CreateCommentMessages.rating.rangeField})
  @Max(5, {message: CreateCommentMessages.rating.rangeField})
  public rating!: number;

  public offerId: string;

  public authorId: string;
}
