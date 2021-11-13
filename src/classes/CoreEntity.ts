export default abstract class CoreEntity {
  e_version: number;

  e_id: number | null;

  protected constructor(version: number) {
    this.e_version = version;
    this.e_id = null;
  }
}
