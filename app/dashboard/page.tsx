import Portal from '../portal';
import {requireUser} from '../auth';
export const dynamic='force-dynamic';
export default async function Dashboard(){await requireUser();return <Portal/>}
