import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ unique: true, nullable: false, type: 'text' })
  email: string;

  @Column({ type: 'text' })
  hash: string;

  @Column({ type: 'text', nullable: true })
  hashedRt: string;
}
