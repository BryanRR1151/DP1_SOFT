/*
    Worker.java
    v1.0
    Created : 29/04/23
    Modified: 29/04/23
*/

package dp1soft.app.worker;

import dp1soft.app.logic.Genetic;
import dp1soft.app.model.*;

import java.util.ArrayList;

public class Worker {
    public static final int DAY = 1440;
    static final int lenghtX = 70;
    static final int lenghtY = 50;
    public static void Simulate(){
        Environment env = Utils.buildMap(lenghtX, lenghtY);
        ArrayList<Integer> list;
        ArrayList<Pack> packages = null;
        ArrayList<Pack> init = null;
        ArrayList<Vehicle> vehicles = null;
        ArrayList<Blockage> blockages;
        ArrayList<Integer> faults = null;
        Solution solution;
        int i, load;
        boolean first = true;

        //region Carga de Archivos
        try {
            packages = Utils.importPackages();
            init = Utils.importPackages();
        } catch(Exception ex) {
            System.out.println("Error with file importing");
            System.exit(0);
        }
        try {
            vehicles = Utils.importVehicles();
        } catch(Exception ex) {
            System.out.println("Error with file importing");
            System.exit(0);
        }
        try {
            blockages = Utils.importBlockages();
            env.setBlockList(blockages);
        } catch(Exception ex) {
            System.out.println("Error with file importing");
            System.exit(0);
        }
        try {
            faults = Utils.importFaults();
        } catch(Exception ex) {
            System.out.println("Error with file importing");
            System.exit(0);
        }
        //endregion

        //Esto esta simulando un dia
        for (i=0; i<DAY * 30; i++){
            if(i == 152){
                i++;
                i--;
            }
            env.setTime(i);
            if(i%DAY == 0 && !first){
                Utils.buyVehicles(vehicles);
                System.out.println("Es el dia " + (i/DAY + 1));
                for(Pack p : init){
                    p.setIdCustomer(p.getIdCustomer() + 33);
                    p.setId(p.getId() + 33);
                    p.setTime(p.getTime() + DAY);
                    p.setOriginalTime(p.getTime());
                    p.setDeadline(p.getDeadline() + DAY);
                    p.setFullfilled(0);
                    p.setUnassigned(p.getDemand());
                }
                for(int k = 0; k < faults.size() - 1; k += 2){
                    faults.set(k, faults.get(k) + DAY);
                }
                packages.addAll(init);
            }
            first = false;
            System.out.println("Son las " + Utils.timeString(i));
            Utils.checkBlockage(env, vehicles);
            if(i % 480 == 0){
                Utils.repairVehicle(vehicles);
            }
            for(int k = 0; k < faults.size() - 1; k += 2){
                if(faults.get(k) == i){
                    Utils.killVehicle(env, packages, vehicles, faults.get(k + 1));
                }
            }
            list = Utils.checkPackage(packages, i);
            for(int x=0; x < list.size(); x++) {
                System.out.println("Se recibió un pedido");
                solution = Genetic.getBestRoute(env, vehicles, packages.get(list.get(x)), i);
                if(solution == null){
                    //No implementado
                    return;
                }
                if(solution.isLate()){
                    System.out.println("Colapso Logístico");
                    return;
                }
                System.out.println("Se encontró una solución de " + solution.getChroms().size() + " pasos");
                vehicles.get(solution.getiVehicle()).setRoute(solution);
                vehicles.get(solution.getiVehicle()).setState(1);
                vehicles.get(solution.getiVehicle()).setStep(0);
                vehicles.get(solution.getiVehicle()).setPack(new Pack(packages.get(list.get(x))));
                vehicles.get(solution.getiVehicle()).setTurn(i/480);
                load = Integer.min(vehicles.get(solution.getiVehicle()).getCapacity(), packages.get(list.get(x)).getUnassigned());
                vehicles.get(solution.getiVehicle()).setCarry(load);
                packages.get(list.get(x)).setUnassigned(packages.get(list.get(x)).getUnassigned() - load);
                if(packages.get(list.get(x)).getUnassigned() > 0){
                    list.add(list.get(x));
                }
            }
            Utils.moveVehicles(env, vehicles, packages);
        }
        /*
        double sum = 0;
        for(Integer t : times){
            sum += t;
        }
        sum = sum/times.size();
        System.out.println("En promedio, el tiempo restante por pedido es: " + sum);
        */
    }
}
