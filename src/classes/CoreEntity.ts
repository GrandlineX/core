import { Column } from './annotation';

export default abstract class CoreEntity {
  @Column({
    primaryKey: true,
  })
  e_id: number | null;

  protected constructor() {
    this.e_id = null;
  }
}
